module.exports = {
    extends: "airbnb",
    env: {
        jest: true,
    },
    settings: {
        "import/resolver": {
        node: {
            paths: ["src"]
        }
        }
    },
    rules: {
        "react/button-has-type": "off",
        "react/prefer-stateless-function": "off",
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/no-static-element-interactions": "off",
    }
};