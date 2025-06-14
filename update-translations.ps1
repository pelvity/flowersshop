# PowerShell script to update all components that use useLanguage to use useTranslations

# Set up logging
$logFile = "translation-update-log.txt"
$htmlReport = "translation-update-report.html"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"Translation Update Log - $timestamp" | Out-File -FilePath $logFile
"=======================================================" | Out-File -FilePath $logFile -Append

# Stats counters
$totalFiles = 0
$updatedFiles = 0
$errorFiles = 0
$skippedFiles = 0

# Arrays to store detailed results
$updatedFilesList = @()
$errorFilesList = @()
$skippedFilesList = @()

# Get all files that import useLanguage
Write-Host "Searching for files that use useLanguage..." -ForegroundColor Cyan
"Searching for files that use useLanguage..." | Out-File -FilePath $logFile -Append

$files = Get-ChildItem -Path . -Recurse -Include "*.tsx", "*.ts" | 
         Where-Object { $_.FullName -notlike "*\node_modules\*" } |
         Select-String -Pattern "import \{ useLanguage \} from" | 
         Select-Object -ExpandProperty Path -Unique

$totalFiles = $files.Count
"Found $totalFiles files to update" | Tee-Object -FilePath $logFile -Append
"" | Out-File -FilePath $logFile -Append

foreach ($file in $files) {
    $message = "Processing $file"
    Write-Host $message
    $message | Out-File -FilePath $logFile -Append
    $fileObj = @{
        Path = $file
        Status = "Unknown"
        Message = ""
    }
    
    try {
        # Check if file exists
        if (-not (Test-Path $file)) {
            $errorMessage = "File does not exist"
            Write-Host "  - ERROR: $errorMessage" -ForegroundColor Red
            "  - ERROR: $errorMessage" | Out-File -FilePath $logFile -Append
            $errorFiles++
            $fileObj.Status = "Error"
            $fileObj.Message = $errorMessage
            $errorFilesList += $fileObj
            continue
        }
        
        # Read the file content
        $content = Get-Content -Path $file -Raw
        
        # Skip if file is empty
        if ([string]::IsNullOrEmpty($content)) {
            $skipMessage = "File is empty"
            Write-Host "  - SKIPPED: $skipMessage" -ForegroundColor Yellow
            "  - SKIPPED: $skipMessage" | Out-File -FilePath $logFile -Append
            $skippedFiles++
            $fileObj.Status = "Skipped"
            $fileObj.Message = $skipMessage
            $skippedFilesList += $fileObj
            continue
        }
        
        # Make a backup of the file
        $backupFile = "$file.bak"
        Copy-Item -Path $file -Destination $backupFile -Force
        "  - Created backup: $backupFile" | Out-File -FilePath $logFile -Append
        
        # Replace the import statement
        $newContent = $content -replace "import \{ useLanguage \} from [`"']@/context/language-context[`"'];", "import { useTranslations } from 'next-intl';"
        
        # Replace the usage
        $newContent = $newContent -replace "const \{ t \} = useLanguage\(\);", "const t = useTranslations();"
        
        # Handle other potential patterns
        $newContent = $newContent -replace "useLanguage\(\)", "useTranslations()"
        
        # Check if anything changed
        if ($content -ne $newContent) {
            # Write the updated content back to the file
            Set-Content -Path $file -Value $newContent -Encoding UTF8
            "  - Updated successfully" | Tee-Object -FilePath $logFile -Append
            $updatedFiles++
            $fileObj.Status = "Updated"
            $fileObj.Message = "Successfully updated"
            $updatedFilesList += $fileObj
        } else {
            "  - No changes needed" | Tee-Object -FilePath $logFile -Append
            $skippedFiles++
            $fileObj.Status = "Skipped"
            $fileObj.Message = "No changes needed"
            $skippedFilesList += $fileObj
        }
    }
    catch {
        $errorMessage = $_
        Write-Host "  - ERROR: $errorMessage" -ForegroundColor Red
        "  - ERROR: $errorMessage" | Out-File -FilePath $logFile -Append
        $errorFiles++
        $fileObj.Status = "Error"
        $fileObj.Message = $errorMessage
        $errorFilesList += $fileObj
    }
}

# Summary
"" | Out-File -FilePath $logFile -Append
"=======================================================" | Out-File -FilePath $logFile -Append
"SUMMARY" | Out-File -FilePath $logFile -Append
"=======================================================" | Out-File -FilePath $logFile -Append
"Total files processed: $totalFiles" | Tee-Object -FilePath $logFile -Append
"Files updated: $updatedFiles" | Tee-Object -FilePath $logFile -Append
"Files skipped: $skippedFiles" | Tee-Object -FilePath $logFile -Append
"Files with errors: $errorFiles" | Tee-Object -FilePath $logFile -Append
"=======================================================" | Out-File -FilePath $logFile -Append

$completionMessage = "All files processed. See $logFile for details."
Write-Host $completionMessage -ForegroundColor Green
$completionMessage | Out-File -FilePath $logFile -Append

# Generate HTML report
$htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>Translation Update Report - $timestamp</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .summary { margin: 20px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px; }
        .summary span { font-weight: bold; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .updated { color: green; }
        .error { color: red; }
        .skipped { color: orange; }
        .section { margin-top: 30px; }
    </style>
</head>
<body>
    <h1>Translation Update Report</h1>
    <p>Generated on: $timestamp</p>
    
    <div class="summary">
        <h2>Summary</h2>
        <p>Total files processed: <span>$totalFiles</span></p>
        <p>Files updated: <span class="updated">$updatedFiles</span></p>
        <p>Files skipped: <span class="skipped">$skippedFiles</span></p>
        <p>Files with errors: <span class="error">$errorFiles</span></p>
    </div>
    
    <div class="section">
        <h2>Updated Files</h2>
        <table>
            <tr>
                <th>File Path</th>
                <th>Status</th>
                <th>Message</th>
            </tr>
"@

foreach ($file in $updatedFilesList) {
    $htmlContent += @"
            <tr>
                <td>$($file.Path)</td>
                <td class="updated">$($file.Status)</td>
                <td>$($file.Message)</td>
            </tr>
"@
}

$htmlContent += @"
        </table>
    </div>
    
    <div class="section">
        <h2>Skipped Files</h2>
        <table>
            <tr>
                <th>File Path</th>
                <th>Status</th>
                <th>Message</th>
            </tr>
"@

foreach ($file in $skippedFilesList) {
    $htmlContent += @"
            <tr>
                <td>$($file.Path)</td>
                <td class="skipped">$($file.Status)</td>
                <td>$($file.Message)</td>
            </tr>
"@
}

$htmlContent += @"
        </table>
    </div>
    
    <div class="section">
        <h2>Error Files</h2>
        <table>
            <tr>
                <th>File Path</th>
                <th>Status</th>
                <th>Message</th>
            </tr>
"@

foreach ($file in $errorFilesList) {
    $htmlContent += @"
            <tr>
                <td>$($file.Path)</td>
                <td class="error">$($file.Status)</td>
                <td>$($file.Message)</td>
            </tr>
"@
}

$htmlContent += @"
        </table>
    </div>
</body>
</html>
"@

$htmlContent | Out-File -FilePath $htmlReport -Encoding UTF8

Write-Host "HTML report generated: $htmlReport" -ForegroundColor Green 