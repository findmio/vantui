import React, { useState, useEffect } from 'react'
import MarkdownBox from '../components/markdown/index.js'

export default function Docs() {
  const [md, setMd] = useState('')

  useEffect(() => {
    mdAction()
    window.addEventListener('hashchange', mdAction)
  }, [])

  const mdAction = function () {
    const hashArr = location.hash.split('?')
    const target = hashArr[0].replace('#/', '')

    setMd(__vantui_base__.md[target])
    const t = __vantui_base__?.routers.find((item) => item.path === target)
    document.title = t.title
  }

  return <MarkdownBox>{md}</MarkdownBox>
}
