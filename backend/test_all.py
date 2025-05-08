import pytest


class TestClass:
    def test_one(self):
        s = "hello"
        assert "h" in s

    def test_two(self):
        s = "hello"
        assert "o" in s

    def add(self, expression: str) -> int:
        return eval(expression)

    @pytest.mark.parametrize(
        "test_input,expected",
        [
            ("-4-5", -9),
            ("4+5", 9),
            ("4.6+5.88", 10.48),
            ("4.6*5.88", 27.048),
            ("4.6/5.88", 0.782312925170068),
        ],
    )
    def test_eval_add(self, test_input: str, expected):
        print(test_input)
        result = self.add(test_input)
        assert result == expected
