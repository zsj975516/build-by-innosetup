; 脚本由 Inno Setup 脚本向导 生成！
; 有关创建 Inno Setup 脚本文件的详细资料请查阅帮助文档！

#define EnglishName "{{EnglishName}}"
#define AppName "{{AppName}}"
#define AppVersion "{{AppVersion}}"
#define AppPublisher "{{AppPublisher}}"
#define AppExeName "{{AppExeName}}"
#define AppExePath "{{AppExePath}}"
#define FilesPath "{{FilesPath}}"
#define SetupIconFile "{{SetupIconFile}}"
#define OutputDir "{{OutputDir}}"
#define LicenseFile "{{LicenseFile}}"
#define Copyright "{{Copyright}}"

[Setup]
  ; 注: AppId的值为单独标识该应用程序。
  ; 不要为其他安装程序使用相同的AppId值。
  ; (生成新的GUID，点击 工具|在IDE中生成GUID。)
  AppId={{AppId}}
  AppName={#AppName}
  AppVersion={#AppVersion}
  ;AppVerName={#MyAppName} {#MyAppVersion}
  AppPublisher={#AppPublisher}
  DefaultDirName={pf}\{#EnglishName}
  LicenseFile={#LicenseFile}
  OutputDir={#OutputDir}
  OutputBaseFilename={#AppName}_{{platform}}_{#AppVersion}
  ; 安装文件的图标
  SetupIconFile={#SetupIconFile}
  Compression=lzma
  SolidCompression=yes
  versioninfocopyright={#Copyright}
  VersionInfoVersion={#AppVersion}
  ; 卸载列表名称
  UninstallDisplayName={#AppName}
  ; 卸载列表图标
  UninstallDisplayIcon={#SetupIconFile}

  PrivilegesRequired=admin

  ;AppMutex={#AppName}-{#ProgramsMutexName}

  DisableProgramGroupPage=yes
  DisableDirPage=no
  DisableWelcomePage=no
  ; 64位安装模式
  ;ArchitecturesInstallIn64BitMode=x64

[Languages]
  Name: "chinesesimp"; MessagesFile: "compiler:Default.isl"

[Tasks]
  {{if createDesktopIcon}}
  Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce;
  {{/if}}

[Files]
  ; 注意: 不要在任何共享系统文件上使用“Flags: ignoreversion”
  ;Source: compiler:ISTask.dll; Flags: dontcopy noencryption
  Source: "{#AppExePath}\{#AppExeName}"; DestDir: "{app}"; Flags: ignoreversion
  Source: "{#FilesPath}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
  {{each Files file index}}
  {{if file.Source}} Source: {{file.Source}};{{/if}} {{if file.DestDir}} DestDir: {{file.DestDir}};{{/if}} {{if file.Flags}} Flags: {{file.Flags}};{{/if}}
  {{/each}}

[Icons]
  Name: "{commonprograms}\{#AppName}"; Filename: "{app}\{#AppExeName}"
  {{if createDesktopIcon}}
  Name: "{commondesktop}\{#AppName}"; Filename: "{app}\{#AppExeName}"; Tasks: desktopicon
  {{/if}}

[Registry]
  {{each Registry registry index}}
  {{if registry.Root}} Root: {{registry.Root}};{{/if}} {{if registry.SubKey}} SubKey: {{registry.SubKey}};{{/if}} {{if registry.ValueType}} ValueType: {{registry.ValueType}};{{/if}}{{if registry.ValueName}} ValueName: {{registry.ValueName}}; {{/if}}{{if registry.ValueData}} ValueData: "{{registry.ValueData}}"; {{/if}}{{if registry.Flags}} Flags: {{registry.Flags}}; {{/if}}
  {{/each}}

[Code]
  {{if Code}} {{Code}} {{/if}}

  var ErrorCode: Integer;

	// 程序安装前的函数
	function InitializeSetup(): Boolean;
  begin
		// 关闭应用程序
    ShellExec('open','taskkill.exe','/f /im {#AppExeName}','',SW_HIDE,ewNoWait,ErrorCode);
    //ShellExec('open','tskill.exe','/f {#AppName}','',SW_HIDE,ewNoWait,ErrorCode);
    result := True;
  end;

	// 程序卸载前的函数
	function InitializeUninstall(): Boolean;
  begin
    ShellExec('open','taskkill.exe','/f /im {#AppExeName}','',SW_HIDE,ewNoWait,ErrorCode);
    //ShellExec('open','tskill.exe','/f {#AppName}','',SW_HIDE,ewNoWait,ErrorCode);
    result := True;
  end;
