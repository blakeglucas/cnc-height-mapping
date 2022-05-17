bool switchState = false;

void setup() {
  Serial.begin(9600);
  // put your setup code here, to run once:
  pinMode(22, INPUT_PULLUP);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
}

void loop() {
  int pinState = digitalRead(22);
  if (pinState == LOW && !switchState) {
    switchState = true;
    digitalWrite(LED_BUILTIN, HIGH);
    Serial.write("A\r\n");
  } else if (pinState == HIGH && switchState) {
    switchState = false;
    digitalWrite(LED_BUILTIN, LOW);
  }
}
