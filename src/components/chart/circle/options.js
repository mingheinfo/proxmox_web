function deepCopy (obj) {
  let newObj
  // 如果不是数组对象，并且对象存在，直接返回就可以
  if (obj && typeof obj !== 'object') {
    newObj = obj
    return newObj
  }
  var targetObj = obj.constructor === Array ? [] : {}
  for (var keys in obj) {
    if (obj.hasOwnProperty(keys)) {
      if (obj[keys] && typeof obj[keys] === 'object') {
        targetObj[keys] = obj[keys].constructor === Array ? [] : {}
        targetObj[keys] = deepCopy(obj[keys])
      } else {
        targetObj[keys] = obj[keys]
      }
    }
  }
  return targetObj
  // return JSON.parse(JSON.stringify(obj));
}


const annulusOption = {
  title: {
    text: '',
    subtext: '',
    x: 'center',
    y: '30%',
    textStyle: {
      fontSize: 26,
      color: '#5b92fe'
    },
    subtextStyle: {
      fontSize: 12,
      color: '#616161'
    }
  },
  color: [],
  series: [
    {
      type: 'pie',
      radius: ['65%', '75%'],
      avoidLabelOverlap: false,
      label: {
        normal: {
          show: true,
          position: 'center'
        }
      },
      hoverAnimation: false,
      startAngle: 0,
      data: [{ value: 45 }, { value: 0 }, { value: 0 }]
    }
  ]
}


/**
 * 获取环形图的data，这个图只用于半开环形图， 并且只能有两个数据输入
 * @param {Number[2]} data 两个数据，环形从做到右的数据
 * @param {string[2]} colors  两个数据的颜色
 * @param {*} text 中心的主标题
 * @param {*} subtext  中心的副标题
 * @param {Number} textFontSize
 * @param {Number} subTextFontSize
 */
function getAnnulusOption (data, colors, text, subtext, textFontSize, subTextFontSize) {
  let resultOption = deepCopy(annulusOption)
  let optionColor = ['rgba(0,0,0,0)']
  optionColor = optionColor.concat(colors)
  resultOption.color = optionColor
  resultOption.title.text = text
  resultOption.title.subtext = subtext
  resultOption.title.textStyle.fontSize = textFontSize
  resultOption.title.subtextStyle.fontSize = subTextFontSize
  let firstData = data[0] || 0
  let secondData = data[1] || 0
  resultOption.series[0].data[1].value =  45 * firstData / (firstData + secondData)
  resultOption.series[0].data[2].value =  45 * secondData / (firstData + secondData)
  return resultOption
}



export { getAnnulusOption }
