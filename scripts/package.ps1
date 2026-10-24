$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$archivePath = Join-Path $projectRoot 'N23DCPT019_De04.zip'
$temporaryArchive = Join-Path $projectRoot ('submission-' + [guid]::NewGuid().ToString('N') + '.zip')
$excludedDirectories = @('.git', 'node_modules', '.next', 'data', 'test-results', 'playwright-report')
$excludedFiles = @('.env', '.env.local', '.env.production', '.env.development')
$zip = [System.IO.Compression.ZipFile]::Open($temporaryArchive, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  function Add-ProjectDirectory([string]$directory, [string]$relative) {
    foreach ($item in Get-ChildItem -LiteralPath $directory -Force) {
      if ($item.PSIsContainer) {
        if ($excludedDirectories -notcontains $item.Name) {
          Add-ProjectDirectory $item.FullName ($relative + $item.Name + '/')
        }
      } elseif ($excludedFiles -notcontains $item.Name -and $item.Extension -ne '.zip') {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $item.FullName, ('N23DCPT019_De04/' + $relative + $item.Name)) | Out-Null
      }
    }
  }
  Add-ProjectDirectory $projectRoot ''
} finally {
  $zip.Dispose()
}
Move-Item -LiteralPath $temporaryArchive -Destination $archivePath -Force
Write-Output "Created: $archivePath"
