package com.sibtayn.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.view.KeyEvent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // فعال کردن WebView Debugging در حالت توسعه
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // هندل دکمه Back
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            // این کار توسط Capacitor Bridge هندل می‌شود
            return super.onKeyDown(keyCode, event);
        }
        return super.onKeyDown(keyCode, event);
    }
}
