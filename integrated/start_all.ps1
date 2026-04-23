# START ALL MICROSERVICES SIMULTANEOUSLY
# Run this inside the 'integrated' folder

function Get-MavenCommand {
    $globalMvn = Get-Command mvn -ErrorAction SilentlyContinue
    if ($globalMvn) {
        return "mvn"
    }

    $wrapperMvn = Get-ChildItem -Path "$env:USERPROFILE\.m2\wrapper\dists" -Filter "mvn.cmd" -Recurse -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if ($wrapperMvn) {
        return $wrapperMvn.FullName
    }

    $candidates = @(
        "$env:USERPROFILE\IntelliJ IDEA 2024.3.2.1\plugins\maven\lib\maven3\bin\mvn.cmd",
        "$env:USERPROFILE\.jenkins\tools\hudson.tasks.Maven_MavenInstallation\Maven-3.9\bin\mvn.cmd"
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    return $null
}

function Get-JavaHome {
    if ($env:JAVA_HOME -and (Test-Path $env:JAVA_HOME)) {
        return $env:JAVA_HOME
    }

    $javaCmd = Get-Command java -ErrorAction SilentlyContinue
    if ($javaCmd -and $javaCmd.Source) {
        try {
            $javaExe = (Resolve-Path $javaCmd.Source).Path
            $javaBinDir = Split-Path $javaExe -Parent
            $javaHome = Split-Path $javaBinDir -Parent
            if ((Test-Path $javaHome) -and (Test-Path (Join-Path $javaHome "bin\javac.exe"))) {
                return $javaHome
            }
        } catch {}
    }

    $commonJavaHomes = @(
        "C:\Program Files\Java\jdk-17",
        "C:\Program Files\Java\jdk-21",
        "C:\Program Files\Eclipse Adoptium\jdk-17*",
        "C:\Program Files\Eclipse Adoptium\jdk-21*"
    )

    foreach ($candidate in $commonJavaHomes) {
        if ($candidate.Contains("*")) {
            $match = Get-ChildItem -Path $candidate -Directory -ErrorAction SilentlyContinue |
                Where-Object { Test-Path (Join-Path $_.FullName "bin\javac.exe") } |
                Select-Object -First 1
            if ($match) { return $match.FullName }
        } else {
            if ((Test-Path $candidate) -and (Test-Path (Join-Path $candidate "bin\javac.exe"))) {
                return $candidate
            }
        }
    }

    return $null
}

$services = @(
    "eureka-server",
    "ai-service",
    "event-service",
    "payment-service",
    "certificate-service",
    "quiz-feedback-service",
    "course-service",
    "user-service",
    "job-service",
    "preevaluation-service",
    "api-gateway"
)

$mavenCmd = Get-MavenCommand
$javaHome = Get-JavaHome

if (-not $mavenCmd) {
    Write-Error "Maven was not found. Install Maven or ensure mvn is available in PATH."
    exit 1
}

if (-not $javaHome) {
    Write-Error "JAVA_HOME was not found. Install JDK 17+ or configure JAVA_HOME."
    exit 1
}

if (-not $env:JAVA_HOME) {
    $env:JAVA_HOME = $javaHome
}

Write-Host "Using Maven command: $mavenCmd"
Write-Host "Using JAVA_HOME: $javaHome"

# Kill any leftover Java processes to free ports before restarting
Write-Host "Stopping existing Java processes..."
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Clean stale H2 database files to avoid FK-ordering errors on startup
Write-Host "Cleaning old H2 database files..."
foreach ($svc in $services) {
    $h2Dir = ".\$svc\.h2"
    if (Test-Path $h2Dir) {
        Remove-Item -Recurse -Force $h2Dir
        Write-Host "  Removed $h2Dir"
    }
}

foreach ($svc in $services) {
    if (Test-Path ".\$svc") {
        Write-Host "Starting $svc..."

        if ($svc -eq "api-gateway") {
            # No database — just override the port
            $serviceCmd = "`$env:JAVA_HOME='$javaHome'; Set-Location '.\$svc'; $mavenCmd spring-boot:run '-Dserver.port=8090'"
        } elseif ($svc -eq "preevaluation-service" -or $svc -eq "eureka-server") {
            # preevaluation-service uses H2 in-memory by default (no override needed)
            # eureka-server has no datasource
            $serviceCmd = "`$env:JAVA_HOME='$javaHome'; Set-Location '.\$svc'; $mavenCmd spring-boot:run"
        } elseif ($svc -eq "user-service") {
            # user-service needs Google OAuth2 placeholders to start without real credentials
            $h2Url = "jdbc:h2:file:./.h2/$svc-db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE"
            $serviceCmd = "`$env:JAVA_HOME='$javaHome'; `$env:SPRING_DATASOURCE_URL='$h2Url'; `$env:SPRING_DATASOURCE_DRIVER_CLASS_NAME='org.h2.Driver'; `$env:SPRING_DATASOURCE_USERNAME='sa'; `$env:SPRING_DATASOURCE_PASSWORD=''; `$env:SPRING_JPA_HIBERNATE_DDL_AUTO='create'; `$env:GOOGLE_CLIENT_ID='dev-placeholder'; `$env:GOOGLE_CLIENT_SECRET='dev-placeholder'; Set-Location '.\$svc'; $mavenCmd spring-boot:run"
        } else {
            # Use environment variables — Spring Boot binds them automatically, no quoting issues
            $h2Url = "jdbc:h2:file:./.h2/$svc-db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE"
            $serviceCmd = "`$env:JAVA_HOME='$javaHome'; `$env:SPRING_DATASOURCE_URL='$h2Url'; `$env:SPRING_DATASOURCE_DRIVER_CLASS_NAME='org.h2.Driver'; `$env:SPRING_DATASOURCE_USERNAME='sa'; `$env:SPRING_DATASOURCE_PASSWORD=''; `$env:SPRING_JPA_HIBERNATE_DDL_AUTO='create'; Set-Location '.\$svc'; $mavenCmd spring-boot:run"
        }

        Start-Process powershell -ArgumentList "-NoExit", "-Command", $serviceCmd
    } else {
        Write-Warning "Folder .\$svc not found!"
    }
}

Write-Host "All services are launching at the same time. Check each PowerShell window for logs."
