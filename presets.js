window.SM_PRESETS = {
  "door": [
    {
      "name": "Шлюз (XOR)",
      "desc": "Управление дверью с двух сторон (внутри и снаружи).",
      "chain": ["switch", "switch", "logic_gate", "controller"],
      "connections": ["Оба Switch → Logic Gate (XOR)", "Logic Gate → Controller"]
    }
  ],
  "thruster": [
    {
      "name": "Стабилизация (Vanilla)",
      "desc": "Классическая стабилизация. Требует настройки Logic Gate в режим Math.",
      "chain": ["fant_angle_sensor", "logic_gate", "thruster"],
      "connections": ["Angle Sensor -> Logic Gate (Math Mode) -> Thruster"]
    }
  ]
};
