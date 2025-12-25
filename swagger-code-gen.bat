@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM Set variables
SET SWAGGER_CLI="C:\swagger\swagger-codegen-cli-3.0.66.jar"
SET OUTPUT_DIR=.\src\app\gen
SET MODEL_DIR=%OUTPUT_DIR%\model
SET CONFIG_FILE=.\swagger-config.json
SET SWAGGER_URL=http://localhost:3381/swagger/v1/swagger.json

REM Check if Java is installed
java -version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Java is not installed. Please install Java first.
    exit /b 1
)

REM Remove existing model directory
IF EXIST %MODEL_DIR% (
    echo Deleting existing model directory...
    rmdir /s /q %MODEL_DIR%
)

REM Run Swagger Codegen
echo Running Swagger Codegen...
java -jar %SWAGGER_CLI% generate -i %SWAGGER_URL% -l typescript-angular -o %OUTPUT_DIR% -c %CONFIG_FILE%

REM Fix file attributes (removes Read-Only if needed)
attrib -R /S /D %MODEL_DIR%\*

echo Code generation completed!
ENDLOCAL
pause
