#####################################################################################
# Create self signed certificates for
# https://cathedral.local
#####################################################################################

# https://github.com/stopthatastronaut/poshdotenv
if(-not (Get-Module -Name DotEnv -ListAvailable)) {
    Install-Module -Name DotEnv -Scope CurrentUser -Force
}

Import-Module DotEnv

# https://github.com/richardszalay/pshosts
if(-not (Get-Module -Name PsHosts -ListAvailable)) {
    Install-Module -Name PsHosts -Scope CurrentUser -Force
}

Import-Module PsHosts

# Load the .env file
Set-DotEnv

$openssl = $env:ProgramFiles + '\Git\usr\bin\openssl.exe'
$certFolder = '.\certs'
$host = [System.Uri]$env:NUXT_ORIGIN | Select-Object -ExpandProperty Host
$sslPass = $env:NUXT_ORIGIN_SSL_PASSPHRASE

function Create-Certificate {
    $confFileContent = @"
[req]
default_bits = 2048
default_keyfile = $($host).key
distinguished_name = req_distinguished_name
req_extensions = req_ext
x509_extensions = v3_ca

[req_distinguished_name]
commonName = $($host)

[req_ext]
subjectAltName = @alt_names

[v3_ca]
subjectAltName = @alt_names
basicConstraints = critical, CA:false
keyUsage = keyCertSign, cRLSign, digitalSignature,keyEncipherment
extendedKeyUsage = 1.3.6.1.5.5.7.3.1
1.3.6.1.4.1.311.84.1.1 = DER:01

[alt_names]
DNS.1 = $($host)
"@

    # create the conf file
    $confFile = Join-Path -Path $certFolder -ChildPath "$($host).conf"
    Set-Content -Path $confFile -Value $confFileContent

    # create new certificate for the domain
    & $openssl req -x509 -nodes -days 365 -newkey rsa:2048  `
        -keyout $certFolder\$(host).key `
        -out $certFolder\$(host).crt `
        -config $confFile `
        -subj "/CN=$($host)"

    # create pfx
    & $openssl pkcs12 -export `
        -out $certFolder\$($host).pfx `
        -inkey $certFolder\$($host).key `
        -in $certFolder\$($host).crt `
        -passout pass:$($host)
}

# Add the certificate to the Trusted Root Certification Authorities store
function Trust-Certificate {
    $cert = "$certFolder\$($host).crt"
    $localhostCaCert = New-Object -TypeName "System.Security.Cryptography.X509Certificates.X509Certificate2" @($cert)
    $storeName = [System.Security.Cryptography.X509Certificates.StoreName]::Root
    $storeLocation = [System.Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store($storeName, $storeLocation)
    $store.Open(([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite))

    try {
        $store.Add($localhostCaCert)
        Write-Host "Certificate added to Root store"
        Write-Host "Certificate Thumbprint: $($localhostCaCert.Thumbprint)"
    }
    finally {
        $store.Close()
        $store.Dispose()
    }
}

Create-Certificate
Trust-Certificate
Set-HostEntry $host 127.0.0.1