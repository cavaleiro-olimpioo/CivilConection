@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Civil Connection - Ambiente de Desenvolvimento

echo ==============================================================================
echo                      CIVIL CONNECTION - STARTUP
echo                Conectando ideias, construindo o futuro
echo ==============================================================================
echo.

set "JAVA_CMD="
set "JAVA_MAJOR="
set "SERVER_PORT=8080"

rem Ignora JAVA_HOME inválido, como C:\Program Files\Common Files\Oracle\Java
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
if defined JAVA_CMD call :detect_java
if defined JAVA_MAJOR if !JAVA_MAJOR! LSS 17 set "JAVA_CMD="
if defined JAVA_MAJOR if !JAVA_MAJOR! GTR 22 set "JAVA_CMD="

if not defined JAVA_CMD call :find_jdk
if not defined JAVA_CMD for %%J in (java.exe) do (
    set "PATH_JAVA=%%~$PATH:J"
    if defined PATH_JAVA if /i not "!PATH_JAVA!"=="C:\Program Files\Common Files\Oracle\Java\javapath\java.exe" set "JAVA_CMD=!PATH_JAVA!"
)
if defined JAVA_CMD call :detect_java

if not defined JAVA_MAJOR goto :java_error
if !JAVA_MAJOR! LSS 17 goto :java_error
if !JAVA_MAJOR! GTR 22 goto :java_error

for %%J in ("%JAVA_CMD%") do set "JAVA_BIN_DIR=%%~dpJ"
for %%J in ("%JAVA_BIN_DIR%..") do set "JAVA_HOME=%%~fJ"
set "PATH=%JAVA_HOME%\bin;%PATH%"

call :find_free_port

echo Usando Java !JAVA_MAJOR! em %JAVA_HOME%
echo Iniciando backend Spring Boot (porta !SERVER_PORT!)...
echo Acesse http://localhost:!SERVER_PORT! no seu navegador.
echo Pressione Ctrl+C a qualquer momento para encerrar o servidor.
echo.

pushd "%~dp0backend"
set "SERVER_PORT=!SERVER_PORT!"
call gradlew.bat bootRun
set "EXIT_CODE=!ERRORLEVEL!"
popd
exit /b !EXIT_CODE!

:find_free_port
for /l %%P in (8080,1,8099) do (
    netstat -ano | findstr ":%%P " >nul
    if errorlevel 1 (
        set "SERVER_PORT=%%P"
        exit /b 0
    )
)
exit /b 0

:find_jdk
for /l %%V in (17,1,22) do (
    if not defined JAVA_CMD (
        for /d %%D in (
            "%ProgramFiles%\Java\jdk-%%V*"
            "%ProgramFiles%\Java\jdk-%%V*"
            "%ProgramFiles%\Eclipse Adoptium\jdk-%%V*"
            "%ProgramFiles%\Microsoft\jdk-%%V*"
            "%ProgramFiles%\Amazon Corretto\jdk%%V*"
        ) do (
            if exist "%%~fD\bin\java.exe" set "JAVA_CMD=%%~fD\bin\java.exe"
        )
    )
)
exit /b

:detect_java
set "JAVA_VERSION="
set "JAVA_MAJOR="
"%JAVA_CMD%" -version 2> "%TEMP%\javaver.txt"
for /f "tokens=3 delims= " %%V in ('findstr /r /c:"version" "%TEMP%\javaver.txt"') do set "JAVA_VERSION=%%~V"
del "%TEMP%\javaver.txt" 2>nul
set "JAVA_VERSION=%JAVA_VERSION:"=%"
for /f "tokens=1 delims=." %%V in ("%JAVA_VERSION%") do set "JAVA_MAJOR=%%V"
if "%JAVA_MAJOR%"=="1" for /f "tokens=2 delims=." %%V in ("%JAVA_VERSION%") do set "JAVA_MAJOR=%%V"
exit /b

:java_error
echo [ERRO] Este projeto requer um JDK 17 ou superior (compatvel com o Gradle 8.8).
echo Instale um JDK 17/21/22 e defina JAVA_HOME para a pasta raiz do JDK.
echo Exemplo: C:\Program Files\Java\jdk-17
exit /b 1
