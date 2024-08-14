############################################################################
# deletes the certificates and host entries created by create-dev-certs.ps1
############################################################################

# https://github.com/stopthatastronaut/poshdotenv
if(-not (Get-Module -Name DotEnv -ListAvailable)) {
    Install-Module -Name DotEnv -Scope CurrentUser -Force
}

# https://github.com/richardszalay/pshosts
if(-not (Get-Module -Name PsHosts -ListAvailable)) {
    Install-Module -Name PsHosts -Scope CurrentUser -Force
}

# Load the .env file
Set-DotEnv

$host = [System.Uri]$env:NUXT_ORIGIN | Select-Object -ExpandProperty Host
$certFolder = '.\certs'

function Remove-Certificate {
    $cert = "$certFolder\$($host).crt"
    $localhostCaCert = New-Object -TypeName "System.Security.Cryptography.X509Certificates.X509Certificate2" @($cert)
    $storeName = [System.Security.Cryptography.X509Certificates.StoreName]::Root
    $storeLocation = [System.Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store($storeName, $storeLocation)
    $store.Open(([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite))

    try {
        $store.Remove($localhostCaCert)
        Write-Host "Certificate removed from Root store"
        Write-Host "Certificate Thumbprint: $($localhostCaCert.Thumbprint)"

        # cleanup file
        Remove-Item -Path $httpsFolder\$($host).crt -Force
        Remove-Item -Path $httpsFolder\$($host).key -Force
        Remove-Item -Path $httpsFolder\$($host).pfx -Force
        Remove-Item -Path $httpsFolder\$($host).conf -Force

        Write-Host "$($host) certificate files removed"
    } finally {
        $store.Close()
        $store.Dispose()
    }
}

Remove-Certificate
Remove-HostEntry $host