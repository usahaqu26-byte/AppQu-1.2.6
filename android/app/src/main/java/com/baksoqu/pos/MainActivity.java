package com.baksoqu.pos;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Inisialisasi Android SplashScreen Jetpack agar transisi splash mulus dan tidak blank hitam
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
    }
}
