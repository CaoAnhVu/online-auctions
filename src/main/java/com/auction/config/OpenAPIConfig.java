package com.auction.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Value("${server.port}")
    private String serverPort;

    @Bean
    public OpenAPI myOpenAPI() {
        Server devServer = new Server()
            .url("http://localhost:" + serverPort)
            .description("Server URL in Development environment");

        Contact contact = new Contact()
            .name("Online Auction Support")
            .email("support@auction.com");

        License mitLicense = new License()
            .name("MIT License")
            .url("https://choosealicense.com/licenses/mit/");

        Info info = new Info()
            .title("Online Auction API Documentation")
            .version("1.0.0")
            .contact(contact)
            .description("This API exposes endpoints for managing online auctions.")
            .license(mitLicense);

        return new OpenAPI()
            .info(info)
            .servers(List.of(devServer));
    }
}