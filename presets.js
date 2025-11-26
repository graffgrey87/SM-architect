window.SM_PRESETS = {
  "door": [
    {
      "name": "Шлюз (XOR)",
      "desc": "Управление дверью с двух сторон (внутри и снаружи).",
      "chain": ["switch", "switch", "xor", "door"],
      "connections": ["[1] Switch (Внешний) → [3] XOR", "[2] Switch (Внутренний) → [3] XOR", "[3] XOR → [4] Controller"]
    }
  ],
  "thruster": [
    {
      "name": "Стабилизация1 (Vanilla)",
      "desc": "Классическая стабилизация. Требует настройки Logic Gate в режим Math.",
      "chain": ["fant_angle_sensor", "logic_gate", "thruster"],
      "connections": ["[1] Angle Sensor -> [2] Logic Gate (Math Mode)", "[2] Logic Gate -> [3] Thruster"]
    }
  ],
  "fant_unit_facer": [
    {
      "name": "Авто-турель",
      "desc": "Наведение на цель. Требует два гироскопа или подшипника.",
      "chain": ["fant_unit_facer", "fant_gyroscope"],
      "connections": [
        "[1] Unit Facer -> [2] Gyroscope (Горизонталь/Default Color)",
        "[1] Unit Facer -> [2] Gyroscope (Вертикаль/Любой другой цвет)"
      ]
    }
  ]
};
