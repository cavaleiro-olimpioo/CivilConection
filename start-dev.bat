@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Civil Connection - Ambiente de Desenvolvimento

echo ==============================================================================
echo                      CIVIL CONNECTION - STARTUP
echo                Conectando ideias, construindo o futuro
echo ==============================================================================
echo.

set "JAVA_CMD="
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
if defined JAVA_CMD call :detect_java
if defined JAVA_MAJOR if !JAVA_MAJOR! LSS 17 set "JAVA_CMD="
if defined JAVA_MAJOR if !JAVA_MAJOR! GTR 22 set "JAVA_CMD="

if not defined JAVA_CMD call :find_java21
if not defined JAVA_CMD for %%J in (java.exe) do set "JAVA_CMD=%%~$PATH:J"
if defined JAVA_CMD call :detect_java

if not defined JAVA_MAJOR goto :java_error
if !JAVA_MAJOR! LSS 17 goto :java_error
if !JAVA_MAJOR! GTR 22 goto :java_error

for %%J in ("%JAVA_CMD%") do set "JAVA_BIN_DIR=%%~dpJ"
for %%J in ("%JAVA_BIN_DIR%..") do set "JAVA_HOME=%%~fJ"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo Usando Java !JAVA_MAJOR! em %JAVA_HOME%
echo Iniciando backend Spring Boot (porta 8080)...
echo Acesse http://localhost:8080 no seu navegador.
echo Pressione Ctrl+C a qualquer momento para encerrar o servidor.
echo.

pushd "%~dp0backend"
call gradlew.bat bootRun
set "EXIT_CODE=!ERRORLEVEL!"
popd
exit /b !EXIT_CODE!

:find_java21
for /d %%D in ("%ProgramFiles%\Java\jdk-21*" "%ProgramFiles%\Eclipse Adoptium\jdk-21*" "%ProgramFiles%\Microsoft\jdk-21*") do (
    if not defined JAVA_CMD if exist "%%~fD\bin\java.exe" set "JAVA_CMD=%%~fD\bin\java.exe"
)
exit /b

:detect_java
set "JAVA_VERSION="
set "JAVA_MAJOR="
for /f "tokens=3 delims= " %%V in ('"%JAVA_CMD%" -version 2^>^&1 ^| findstr /r /c:"version"') do set "JAVA_VERSION=%%~V"
set "JAVA_VERSION=%JAVA_VERSION:"=%"
for /f "tokens=1 delims=." %%V in ("%JAVA_VERSION%") do set "JAVA_MAJOR=%%V"
if "%JAVA_MAJOR%"=="1" for /f "tokens=2 delims=." %%V in ("%JAVA_VERSION%") do set "JAVA_MAJOR=%%V"
exit /b

:java_error
echo [ERRO] Este projeto requer um JDK entre as versoes 17 e 22 para o Gradle 8.8.
echo Instale o JDK 21 LTS e defina JAVA_HOME para a pasta dele.
echo Exemplo: C:\Program Files\Java\jdk-21
exit /b 1
