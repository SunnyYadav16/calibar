pub fn run() {
    let builder = tauri::Builder::default();

    // The e2e feature is never enabled for shipped builds, which get no plugins (I8).
    #[cfg(feature = "e2e")]
    let builder = builder
        .plugin(tauri_plugin_wdio_webdriver::init())
        .setup(|app| {
            use tauri::Manager;
            if let Some(window) = app.get_webview_window("main") {
                window.show()?;
            }
            Ok(())
        });

    builder
        .run(tauri::generate_context!())
        .expect("error while running calibar");
}
