module.exports = {
  "compact": false,
  "presets": [
    [
      "@babel/preset-env",
      {
      "modules": false,
      "targets": {
       "browsers": ["> 1%", "last 2 versions", "not ie <=8"]
      },
      "useBuiltIns": "entry"
    }
   ],
   "@babel/preset-react"
  ],
  sourceType:'unambiguous',
  "plugins": [
    "@babel/plugin-transform-runtime",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-syntax-jsx",
    "transform-vue-jsx",
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ]
  ]
}
