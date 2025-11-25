window.SM_PRESETS = {
  "door": [
    {
      "name": "Шлюз (XOR)",
      "desc": "Управление дверью с двух сторон (внутри и снаружи).",
      "chain": ["switch", "switch", "xor", "door"],
      "connections": ["Оба Switch → XOR", "XOR → Controller"]
    }
  ],
  "thruster": [
    {
      "name": "Стабилизация (Vanilla)",
      "desc": "Классическая стабилизация. Требует настройки Logic Gate в режим Math.",
      "chain": ["fant_angle_sensor", "logic_gate", "thruster"],
      "connections": ["Angle Sensor -> Logic Gate (Math Mode) -> Thruster"]
    }
  ],
  "fant_unit_facer": [
    {
      "name": "Авто-турель",
      "desc": "Наведение на цель. Требует два гироскопа или подшипника.",
      "chain": ["fant_unit_facer", "fant_gyroscope"],
      "connections": [
        "Unit Facer -> Gyroscope (Горизонталь/Default Color)",
        "Unit Facer -> Gyroscope (Вертикаль/Любой другой цвет)"
      ]
    }
  ]
};
