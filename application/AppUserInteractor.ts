import * as cbor from 'cbor-web'
import Interactor from './Interactor';
import type AppUser from '~/domain/AppUser';

// FIXME: Clean architecture violations

/**
 * Generates a random 16-byte value.
 * @returns {Uint8Array} a random 16-byte value
 */
const genByte16 = () => {
    const uuid = crypto.randomUUID(),
        hexString = uuid.replace(/-/g, '');

    // hexadecimal string to byte values (each byte is represented by 2 hex characters)
    // Ref: https://w3c.github.io/webauthn/#sctn-cryptographic-challenges
    return Uint8Array.from({ length: hexString.length / 2 }, (_, i) =>
        parseInt(hexString.substring(i * 2, 2), 16)
    );
}

function toBase64Url(uint8Array: Uint8Array): string {
    // Convert Uint8Array to binary string
    const binaryString = String.fromCharCode(...uint8Array);
    // Encode binary string to base64
    const base64String = btoa(binaryString);
    // Convert base64 to base64url
    return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * A class to manage user registration and authentication.
 * @see https://webauthn.guide/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API
 */
export default class AppUserInteractor extends Interactor<AppUser> {
    static readonly timeout: number = 60000

    override async create({ name, displayName }: Pick<AppUser, 'name' | 'displayName'>): Promise<AppUser['id']> {
        const challenge = genByte16(),
            base64Challenge = toBase64Url(challenge)

        const credential = await navigator.credentials.create({
            publicKey: {
                challenge,
                rp: {
                    name: 'Final Hill: Cathedral',
                    id: location.hostname
                },
                user: {
                    id: genByte16(),
                    name,
                    displayName
                },
                // https://github.com/w3c/webauthn/issues/1757
                pubKeyCredParams: [
                    { type: 'public-key', alg: -7 },
                    { type: 'public-key', alg: -8 },
                    { type: 'public-key', alg: -257 }
                ],
                authenticatorSelection: {
                    userVerification: 'preferred'
                    // authenticatorAttachment: "cross-platform",
                },
                timeout: AppUserInteractor.timeout
                // https://w3c.github.io/webauthn/#attestation-conveyance
                // attestation: "direct"
            }
        }) as PublicKeyCredential | null;

        if (!credential)
            throw new Error('credential creation failed');

        const { clientDataJSON, attestationObject } = credential.response as AuthenticatorAttestationResponse

        const utf8Decoder = new TextDecoder('utf-8'),
            decodedClientData = utf8Decoder.decode(clientDataJSON),
            { challenge: responseChallenge, origin, type } =
                JSON.parse(decodedClientData) as { challenge: string, origin: string, type: string };

        if (responseChallenge !== base64Challenge)
            throw new Error('challenge mismatch');
        if (origin !== location.origin)
            throw new Error('origin mismatch');
        if (type !== 'webauthn.create')
            throw new Error('type mismatch');

        type CborDecodeResult = { authData: Uint8Array, fmt: string, attStmt: { sig: Uint8Array, x5c: Uint8Array[] } };

        const decodedAttestationObject: CborDecodeResult = cbor.decode(new Uint8Array(attestationObject)),
            { authData, fmt, attStmt: { sig, x5c } } = decodedAttestationObject;

        // get the length of the credential ID
        const dataView = new DataView(new ArrayBuffer(2)),
            idLenBytes = authData.slice(53, 55);

        idLenBytes.forEach((value, index) => dataView.setUint8(index, value));

        const credentialIdLength = dataView.getUint16(0),
            credentialId = authData.slice(55, 55 + credentialIdLength),
            publicKeyBytes = authData.slice(55 + credentialIdLength);

        type DecodedKeyBuffer = { 1: number, 3: number, '-1': number, '-2': Uint8Array, '-3': Uint8Array };

        const decodedKeyBuffer: DecodedKeyBuffer = cbor.decode(publicKeyBytes.buffer);

        const b64Id = toBase64Url(credentialId)

        this.repository.createWithId({
            id: b64Id,
            name,
            displayName,
            publicKey: toBase64Url(publicKeyBytes)
        });

        return b64Id;
    }

    async authenticateUser(credentialId: string) {
        const challenge = genByte16()

        const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
            challenge,
            rpId: location.hostname,
            userVerification: 'preferred',
            allowCredentials: [{
                id: Uint8Array.from(credentialId, c => c.charCodeAt(0)),
                type: 'public-key'
                // https://w3c.github.io/webauthn/#enum-transport
                // transports: ['usb', 'ble', 'nfc']
            }],
            timeout: AppUserInteractor.timeout
        }

        const credential = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
        });

        const assertion = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
        }) as PublicKeyCredential | null;

        if (!assertion)
            throw new Error('credential assertion failed');

        const assertionResponse = assertion.response as AuthenticatorAssertionResponse,
            clientDataJSON = toBase64Url(new Uint8Array(assertionResponse.clientDataJSON)),
            authenticatorData = toBase64Url(new Uint8Array(assertionResponse.authenticatorData)),
            signature = toBase64Url(new Uint8Array(assertionResponse.signature))




        const storedCredential = await this.repository.get(credentialId);

        if (!storedCredential)
            throw new Error('credential not found');


    }
}