# Script para gerar um certificado SSL auto-assinado para localhost

# Definir o nome do arquivo (sem extensão)
$certName = "localhost"

# Definir a localização para salvar os arquivos
$certPath = ".\"

# Gerar o certificado auto-assinado
$cert = New-SelfSignedCertificate -DnsName $certName -CertStoreLocation "cert:\CurrentUser\My"

# Exportar a chave privada (formato PEM)
$privateKeyPath = "$certPath\$certName-key.pem"
$privateKey = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($cert)
$pemKey = [System.IO.File]::CreateText($privateKeyPath)
$pemKey.Write("-----BEGIN PRIVATE KEY-----`n")
$pemKey.Write([System.Convert]::ToBase64String($privateKey.ExportPkcs8PrivateKey()))
$pemKey.Write("`n-----END PRIVATE KEY-----")
$pemKey.Close()

# Exportar o certificado público (formato PEM)
$publicKeyPath = "$certPath\$certName.pem"
Export-Certificate -Cert $cert -FilePath $publicKeyPath -Type CERT

Write-Host "Certificado e chave gerados com sucesso:"
Write-Host "Certificado: $publicKeyPath"
Write-Host "Chave: $privateKeyPath"
