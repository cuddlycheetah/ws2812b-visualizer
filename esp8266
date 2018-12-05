#include <Arduino.h>
// Use if you want to force the software SPI subsystem to be used for some reason (generally, you don't)
// #define FASTLED_FORCE_SOFTWARE_SPI
// Use if you want to force non-accelerated pin access (hint: you really don't, it breaks lots of things)
// #define FASTLED_FORCE_SOFTWARE_SPI
// #define FASTLED_FORCE_SOFTWARE_PINS
//#define FASTLED_ALLOW_INTERRUPTS 0
#include <FastLED.h>

//#define MAC_ID_SCHRANK1 11794376 /* B3:F7:C8 */
#define MAC_ID_SCHRANK1  3756961 /* 39:53:A1 */
#define MAC_ID_SCHRANK2  4966609 /* 4B:C8:D1 */
#define MAC_ID_SOFA1     782650  /* 0B:F1:3A */ 

// ESP8266 Configs
uint8_t getChip_IP() {
  switch(ESP.getChipId()) {
    case MAC_ID_SCHRANK1: return 220;
    case MAC_ID_SCHRANK2: return 221;
    case MAC_ID_SOFA1:    return 222;
  }
  return 250;
}
int getChip_LEDNUM() {
  switch(ESP.getChipId()) {
    case MAC_ID_SCHRANK1: return 107;
    case MAC_ID_SCHRANK2: return 155;
    case MAC_ID_SOFA1:    return 300;
  }
  return 5;
}
int getChip_BRIGHTNESS() {
  switch(ESP.getChipId()) {
    case MAC_ID_SCHRANK1: return 196;
    case MAC_ID_SCHRANK2: return 255;
    case MAC_ID_SOFA1:    return 255;
  }
  return 0x88;
}
const char * getChip_NAME() {
  switch(ESP.getChipId()) {
    case MAC_ID_SCHRANK1: return "schrank1";
    case MAC_ID_SCHRANK2: return "schrank2";
    case MAC_ID_SOFA1:    return "sofa";
  }
  return "undefined";
}




// OTA Update
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#pragma region "Wifi Details" 

const uint8_t bssid[6]  = { 0xB0, 0x48, 0x7A, 0x99, 0xD4, 0xDC }; // B0:48:7A:99:D4:DC
char ssid[]             = "🐆📶";
char password[]         = "cuddlycheetah";

IPAddress ip;//         (192, 168, 001, 217);
IPAddress gateway       (192, 168,   1,   1);
IPAddress subnet        (255, 255, 255,   0);
IPAddress dns           (192, 168,   1,   1);
IPAddress subscribeIp   (192, 168,   1, 200);
#pragma endregion


#define C_CMD_OFF           0xFF  //! +Fade<bool>

#define C_CMD_DEFAULT       0x00  //! -
#define C_CMD_RAINBOW       0x01  //! -
#define C_CMD_MUSIC         0x02  //! -
#define C_CMD_SETPIXEL      0x03  //! +Pixel<int>
#define C_CMD_RAW_PATTERN   0x04//! !PixelsCount<int> *Pixels(h)<int[]> +Repeat<bool> +Offset<int>

#define C_CMD_SHIFT_MUSIC   0x05 // !+Pixel<int,int,int> RGB
#define C_CMD_SCROLL_MUSIC  0x06 // !+Pixel<int,int,int> RGB

unsigned int ctrlPort = 666;
byte packetBuffer[512];
WiFiUDP ctrlUDP;

/*
unsigned int syncPort = 7777;
WiFiUDP syncUDP;*/
///////////////////////////////////////////////////////////////////////////////////////////

//#define NUM_LEDS 107
int NUM_LEDS = 0;
int CENTER = 0;

int FPS = 70;

#define DATA_PIN D3

uint8_t R = 0;
uint8_t G = 0;
uint8_t B = 0;

CRGB leds[300];
CRGB musicScrollCenter;

byte cMode = C_CMD_OFF;

long lastMillis = 0;
long lastDiffMillis = 0;
void subscribeBroadcast() {
  ctrlUDP.beginPacket(subscribeIp, 666);
  ctrlUDP.write(0xFF);
  ctrlUDP.write(0xFF);
  ctrlUDP.endPacket();
}
void setup() {
  //REG_SET_BIT(0x3ff00014, BIT(0));
  ets_update_cpu_frequency(160);

  Serial.begin(115200);
  Serial.printf(" ESP8266 Chip id = %08X (HEX) %d (DEC)\n", ESP.getChipId(), ESP.getChipId());
  Serial.println("Booting");
  WiFi.mode(WIFI_STA);
  ip = IPAddress(192, 168, 001, getChip_IP());
  WiFi.config(ip, gateway, subnet, dns);
  WiFi.begin(ssid, password, 11, bssid);
  while (WiFi.waitForConnectResult() != WL_CONNECTED) {
    Serial.println("Connection Failed! Rebooting...");
    delay(5000);
    ESP.restart();
  }
  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH) {
      type = "sketch";
    } else { // U_SPIFFS
      type = "filesystem";
    }

    // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
    Serial.println("Start updating " + type);
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) {
      Serial.println("Auth Failed");
    } else if (error == OTA_BEGIN_ERROR) {
      Serial.println("Begin Failed");
    } else if (error == OTA_CONNECT_ERROR) {
      Serial.println("Connect Failed");
    } else if (error == OTA_RECEIVE_ERROR) {
      Serial.println("Receive Failed");
    } else if (error == OTA_END_ERROR) {
      Serial.println("End Failed");
    }
  });
  ArduinoOTA.begin();
  Serial.println("Ready");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  if (MDNS.begin(getChip_NAME())) {  //Start mDNS with name esp8266
    Serial.println("MDNS started");
  } else {
    leds[5] = CRGB::Red;
    MDNS.addService("satan", "udp", 666);
  }
	// sanity check delay - allows reprogramming if accidently blowing power w/leds
  // delay(1000);
  ctrlUDP.begin(ctrlPort);
  //syncUDP.begin(syncPort);
  
  subscribeBroadcast();

  NUM_LEDS = getChip_LEDNUM();
  CENTER = (NUM_LEDS / 2);

  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(getChip_BRIGHTNESS());
}
void ctrlHandle() {
  int noBytes = ctrlUDP.parsePacket();
  if (noBytes) {
    ctrlUDP.read(packetBuffer, noBytes);
    
    byte cCommand = packetBuffer[0];
    switch (cCommand) {
      case C_CMD_OFF: cMode = C_CMD_OFF;
      break;
      case C_CMD_DEFAULT: cMode = C_CMD_DEFAULT;
        if (noBytes > 1) {
          uint8_t cHue = packetBuffer[1];
          uint8_t cSaturation = packetBuffer[2];
          uint8_t cValue = packetBuffer[3];
          CHSV targetColor = CHSV(cHue + 0, cSaturation + 0, cValue + 0);
          for (int i = 0; i < NUM_LEDS; i++)
            leds[i] = targetColor;
        } else 
          for (int i = 0; i < NUM_LEDS; i++)
            leds[i] = CRGB::White;
      break;
      case C_CMD_RAINBOW: cMode = C_CMD_RAINBOW; break;

      case C_CMD_MUSIC: cMode = C_CMD_MUSIC;
        for(int i = 0; i < NUM_LEDS; i++)
          leds[i] = CRGB::White;
      break;
      case C_CMD_SETPIXEL:
        for (int i = 0; i < NUM_LEDS; i++)
          leds[i] = CRGB::Black;

        if (noBytes > 1) {
          cMode = C_CMD_SETPIXEL;
          uint8_t cTarget = packetBuffer[1];
          if (noBytes == 5) {
            uint8_t cHue = packetBuffer[2];
            uint8_t cSaturation = packetBuffer[3];
            uint8_t cValue = packetBuffer[4];
            leds[cTarget + 0] = CHSV(cHue + 0, cSaturation + 0, cValue + 0); // gHue + random8(64), 200, 255
          } else {
            leds[cTarget + 0] = CRGB::White;
          }
        } else {
          for (int i = 0; i < NUM_LEDS; i++)
            leds[i] = CRGB::Red;
        }
      break;
      case C_CMD_RAW_PATTERN: //* !PixelsCount<int> *Pixels(h)<int[]> +Repeat<bool> +Offset<int>

        if (noBytes > 2) {
          cMode = C_CMD_RAW_PATTERN;

          int pixelCount = packetBuffer[1];
          //uint8_t[pixelCount] pixelHues[];

          int patternMode = packetBuffer[1 + 1 + pixelCount];
          bool patternRepeat = patternMode == 1 || patternMode == 11;

          if (patternMode >= 10)
            for (int i = 0; i < NUM_LEDS; i++)
              leds[i] = CRGB::Black;
        
          int patternOffset = packetBuffer[ 1 + 1 + pixelCount + 1];
          int pixelByteIndex = 1;
          if (patternRepeat == false) {
            for (int i = patternOffset; i < patternOffset + pixelCount; i++)
              leds[i] = CHSV(packetBuffer[++pixelByteIndex], 0xFF, 0xFF);
          } else {
            for (int i = patternOffset; i < NUM_LEDS; i++) {
              if (pixelByteIndex > pixelCount) pixelByteIndex = 0;
              leds[i] = CHSV(packetBuffer[++pixelByteIndex], 0xFF, 0xFF);
            }
          }
        } else {
          for (int i = 0; i < NUM_LEDS; i++)
            leds[i] = CRGB::Red;
        }
      break;
      case C_CMD_SHIFT_MUSIC: cMode = C_CMD_SHIFT_MUSIC;
        R = (uint8_t)packetBuffer[1];
        G = (uint8_t)packetBuffer[2];
        B = (uint8_t)packetBuffer[3];

        leds[ CENTER ] = CRGB(R,G,B);

        for(int i=0;i < CENTER; i++)
          leds[ i ] = leds[ i + 1 ];

        for(int i=NUM_LEDS - 1;i > CENTER; i--)
          leds[ i ] = leds[ i - 1 ];

      break;
      case C_CMD_SCROLL_MUSIC: cMode = C_CMD_SCROLL_MUSIC;
        R = (uint8_t)packetBuffer[1];
        G = (uint8_t)packetBuffer[2];
        B = (uint8_t)packetBuffer[3];
        musicScrollCenter = CRGB(R,G,B);
      break;

    }
  }
}
/*void syncHandle() {
  uint8_t N = 0;
  cMode = C_CMD_DEFAULT;
  int packetSize = syncUDP.parsePacket();
  if (packetSize) {
    int len = syncUDP.read(packetBuffer, 512);
    for(int i = 0; i < len; i+=4) {
      packetBuffer[len] = 0;
      N = packetBuffer[i];
      uint8_t R=  (uint8_t)packetBuffer[i+1];
      uint8_t G = (uint8_t)packetBuffer[i+2];
      uint8_t B = (uint8_t)packetBuffer[i+3];
      leds[N] = CRGB(R,G,B);
    }
  }
}*/
uint8_t gHue = 0;
void loop() {
  ArduinoOTA.handle();
  ctrlHandle();
  //syncHandle();

  switch (cMode) {
    /*case C_CMD_DEFAULT:
    case C_CMD_SETPIXEL:
    case C_CMD_RAW_PATTERN:
    case C_CMD_SCROLL_MUSIC:
      fadeToBlackBy( leds, NUM_LEDS, 0);
    break;*/


    case C_CMD_SCROLL_MUSIC:
      EVERY_N_MILLISECONDS( 1000 / FPS ) {
        
        leds[ CENTER ] = musicScrollCenter;

        for(int i=0;i < CENTER; i++)
          leds[ i ] = leds[ i + 1 ];

        for(int i=NUM_LEDS - 1;i > CENTER; i--)
          leds[ i ] = leds[ i - 1 ];
        //fadeToBlackBy( leds, NUM_LEDS,  10);
      }
      fadeToBlackBy( leds, NUM_LEDS, 0);
    break;


    case C_CMD_RAINBOW:
      fill_rainbow( leds, NUM_LEDS, gHue, 2 );
    break;
    case C_CMD_MUSIC:
      fadeToBlackBy( leds, NUM_LEDS, 10);
    break;

    case C_CMD_OFF:
      fadeToBlackBy( leds, NUM_LEDS, 10);
    break;


    default:
      fadeToBlackBy( leds, NUM_LEDS, 0);
    break;
  }
  

   //EVERY_N_MILLISECONDS(1000 / 30) { gHue++; }
  EVERY_N_MILLISECONDS( 1000 / 10 ) { gHue++; } 
  
  long nowMillis = millis();
  long diffMillis = nowMillis - lastMillis;

  FastLED.show();
  lastDiffMillis = diffMillis;
  lastMillis = nowMillis;
  
}
