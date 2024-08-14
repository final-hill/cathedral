#####################################################################################
# Create self signed certificates for
# https://cathedral.local
#####################################################################################

Push-Location ../

# https://github.com/rajivharris/Set-PsEnv
if(-not (Get-Module -Name Set-PsEnv -ListAvailable)) {
    Install-Module -Name Set-PsEnv -Scope CurrentUser -Force
}

Import-Module Set-PsEnv

# https://github.com/richardszalay/pshosts
if(-not (Get-Module -Name PsHosts -ListAvailable)) {
    Install-Module -Name PsHosts -Scope CurrentUser -Force
}

Import-Module PsHosts

# Load the .env file
Set-PsEnv

$openssl = $env:ProgramFiles + '\Git\usr\bin\openssl.exe'
$certFolder = '.\certs'
$hostName = [uri]$env:NUXT_ORIGIN | Select-Object -ExpandProperty Host
$sslPass = $env:NUXT_ORIGIN_SSL_PASSPHRASE

function Create-Certificate {
    $confFileContent = @"
[req]
default_bits = 2048
default_keyfile = $($hostName).key
distinguished_name = req_distinguished_name
req_extensions = req_ext
x509_extensions = v3_ca

[req_distinguished_name]
commonName = $($hostName)

[req_ext]
subjectAltName = @alt_names

[v3_ca]
subjectAltName = @alt_names
basicConstraints = critical, CA:false
keyUsage = keyCertSign, cRLSign, digitalSignature,keyEncipherment
extendedKeyUsage = 1.3.6.1.5.5.7.3.1
1.3.6.1.4.1.311.84.1.1 = DER:01

[alt_names]
DNS.1 = $($hostName)
"@

    # create the cert folder if it doesn't exist
    if(-not (Test-Path -Path $certFolder)) {
        New-Item -Path $certFolder -ItemType Directory
    }
    # create the conf file
    $confFile = Join-Path -Path $certFolder -ChildPath "$($hostName).conf"
    Set-Content -Path $confFile -Value $confFileContent

    # create new certificate for the domain
    & $openssl req -x509 -nodes -days 365 -newkey rsa:2048  `
        -keyout $certFolder\$($hostName).key `
        -out $certFolder\$($hostName).crt `
        -config $confFile `
        -subj "/CN=$($hostName)"

    # create pfx
    & $openssl pkcs12 -export `
        -out $certFolder\$($hostName).pfx `
        -inkey $certFolder\$($hostName).key `
        -in $certFolder\$($hostName).crt `
        -passout pass:$($hostName)
}

# Add the certificate to the Trusted Root Certification Authorities store
function Trust-Certificate {
    $cert = Join-Path -Path $certFolder -ChildPath "$($hostName).crt"
    $absoluteCertPath = Resolve-Path -Path $cert
    $localhostCaCert = New-Object -TypeName "System.Security.Cryptography.X509Certificates.X509Certificate2" $absoluteCertPath
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

# If the cert folder exists, throw an error
if(Test-Path -Path $certFolder) {
    throw "The certs folder already exists. Please delete it and try again."
}

Create-Certificate
Trust-Certificate
Set-HostEntry $hostName 127.0.0.1 -Force

Pop-Location