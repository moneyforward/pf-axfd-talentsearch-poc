package jp.co.moneyforward.hypertm;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // static以下のファイルはデフォルトで配信されるため、特別な設定は不要
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // /api で始まらないリクエストは index.html を返す
        registry.addViewController("/{spring:\\w+}").setViewName("forward:/index.html");
        registry.addViewController("/**/{spring:\\w+}").setViewName("forward:/index.html");
        registry.addViewController("/{spring:\\w+}/**{spring:?!(api)\\w+}").setViewName("forward:/index.html");
    }
}
