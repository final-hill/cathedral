############################################################################
# deletes the certificates and host entries created by create-dev-certs.ps1
############################################################################

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

$hostName = [uri]$env:NUXT_ORIGIN | Select-Object -ExpandProperty Host
$certFolder = '.\certs'

function Remove-Certificate {
    $cert = Join-Path -Path $certFolder -ChildPath "$($hostName).crt"
    $absoluteCertPath = Resolve-Path -Path $cert
    $localhostCaCert = New-Object -TypeName "System.Security.Cryptography.X509Certificates.X509Certificate2" @($absoluteCertPath)
    $storeName = [System.Security.Cryptography.X509Certificates.StoreName]::Root
    $storeLocation = [System.Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store($storeName, $storeLocation)
    $store.Open(([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite))

    try {
        $store.Remove($localhostCaCert)
        Write-Host "Certificate removed from Root store"
        Write-Host "Certificate Thumbprint: $($localhostCaCert.Thumbprint)"

        # cleanup file
        Remove-Item -Path $certFolder -Force -Recurse

        Write-Host "$($hostName) certificate files removed"
    } finally {
        $store.Close()
        $store.Dispose()
    }
}

Remove-Certificate
Remove-HostEntry $hostName

Pop-Location