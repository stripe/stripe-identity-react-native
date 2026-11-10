package com.stripeidentityexample;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;
import com.wix.detox.Detox;
import com.wix.detox.config.DetoxConfig;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class DetoxTest {
    @Rule
    public ActivityTestRule<MainActivity> activityRule =
        new ActivityTestRule<>(MainActivity.class, false, false);

    @Test
    public void runDetoxTests() {
        DetoxConfig config = new DetoxConfig();
        config.rnContextLoadTimeoutSec = BuildConfig.DEBUG ? 180 : 60;
        Detox.runTests(activityRule, config);
    }
}
