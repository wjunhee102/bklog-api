insert into 
  test.block_property (
    block_uuid, 
    type, 
    style, 
    contents
  )
values
  (
    "d5cc2725-97ec-494b-bc80-c16f96379e61", 
    "bk-title", 
    '{
      "color": "black",
      "backgroudColor": "white"
    }', 
    '[
      ["블록 1입니다."],
      ["저", [["b"], ["fc", "#c0f"], ["bc", "#000"], ["i"],["a", "https://www.naver.com"]]],
      ["는 ", [["i"]]],
      ["황준희    ", [["b"], ["_"]]],
      [" 입니다.", [["fc", "#f00"]]]
    ]'
  );