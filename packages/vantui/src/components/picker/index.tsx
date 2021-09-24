/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useRef } from 'react'
import { View } from '@tarojs/components'
import { PickerProps } from '../../../types/picker'
import PickerColumn from '../picker-column/index'
import * as utils from '../wxs/utils'
import Loading from '../loading/index'
import * as computed from './wxs'

export default function Index(props: PickerProps): JSX.Element {
  const {
    valueKey,
    toolbarPosition = 'top',
    defaultIndex,
    columns,
    title,
    cancelButtonText,
    confirmButtonText,
    itemHeight = 88,
    visibleItemCount = 5,
    loading,
    onChange,
    className,
    style,
    onCancel,
    onConfirm,
    showToolbar = true,
    ...others
  } = props

  const [simple, setSimple] = useState(false)
  const children = useRef<Array<any>>([])

  useEffect(
    function () {
      const simple = Boolean(columns.length && !columns[0].values)
      setSimple(simple)
      if (Array.isArray(children) && children.length) {
        setColumns().catch(() => {})
      }
    },
    [columns, children],
  )

  const emit = useCallback(function (event: any) {
    const type = event?.currentTarget?.dataset?.type
    if (typeof event === 'number') {
      if (onChange) {
        onChange({
          picker: children,
          value: simple ? getColumnValue(0) : getValues(),
          index: simple ? getColumnIndex(0) : getIndexes(),
        })
      }
    } else if (type === 'canel') {
      if (onCancel) {
        onCancel({
          value: simple ? getColumnValue(0) : getValues(),
          index: simple ? getColumnIndex(0) : getIndexes(),
        })
      }
    } else if (type === 'confirm') {
      if (onConfirm) {
        onConfirm({
          value: simple ? getColumnValue(0) : getValues(),
          index: simple ? getColumnIndex(0) : getIndexes(),
        })
      }
    }
  }, [])

  const getColumnValue = useCallback(function (index: number) {
    const column = children.current[index]
    return column && column.getValue()
  }, [])

  const getColumnIndex = useCallback(function (columnIndex: number) {
    return (children.current[columnIndex] || {}).getCurrentIndex()
  }, [])

  const setColumns = useCallback(
    function () {
      const columns_ = simple ? [{ values: columns }] : columns
      const stack = columns_.map((column, index) =>
        setColumnValues(index, column.values),
      )
      return Promise.all(stack)
    },
    [columns, simple],
  )

  const setColumnValues = useCallback(function (
    index,
    options,
    needReset = true,
  ) {
    const column = children.current[index]
    if (column == null) {
      return Promise.reject(new Error('setColumnValues: 对应列不存在'))
    }
    const isSame =
      JSON.stringify(column.props.options) === JSON.stringify(options)
    if (isSame) {
      return Promise.resolve()
    }
    return column.set({ options }).then(() => {
      if (needReset) {
        column.setIndex(0)
      }
    })
  },
  [])

  const getValues = useCallback(function () {
    return children.current.map((child) => child.getValue())
  }, [])

  const getIndexes = useCallback(function () {
    return children.current.map((child) => child.getCurrentIndex())
  }, [])

  const onChange_ = emit

  const onTouchMove = useCallback(function () {}, [])

  return (
    <View
      className={`van-picker custom-class ${className}`}
      style={utils.style([style])}
      catchMove
      {...others}
    >
      {toolbarPosition === 'top' && showToolbar && (
        <View className="van-picker__toolbar toolbar-class">
          <View
            className="van-picker__cancel"
            hoverClass="van-picker__cancel--hover"
            hoverStayTime={70}
            data-type="cancel"
            onClick={emit}
          >
            {cancelButtonText || '取消'}
          </View>
          {title && (
            <View className="van-picker__title van-ellipsis">{title}</View>
          )}
          <View
            className="van-picker__confirm"
            hoverClass="van-picker__confirm--hover"
            hoverStayTime={70}
            data-type="confirm"
            onClick={emit}
          >
            {confirmButtonText || '确定'}
          </View>
        </View>
      )}
      {loading && (
        <View className="van-picker__loading">
          <Loading color="#1989fa"></Loading>
        </View>
      )}
      <View
        className="van-picker__columns"
        style={computed.columnsStyle({
          itemHeight,
          visibleItemCount,
        })}
        onTouchMove={onTouchMove}
      >
        {computed.columns(columns).map((item: any, index: number) => {
          return (
            <PickerColumn
              className="van-picker__column column-class"
              key={`van-picker__column_${index}column-class`}
              data-index={index}
              valueKey={valueKey}
              initialOptions={item.values}
              defaultIndex={item.defaultIndex || defaultIndex}
              itemHeight={itemHeight}
              visibleItemCount={visibleItemCount}
              activeClass="active-class"
              onChange={onChange_}
              ref={(el) => (children.current[index] = el)}
            ></PickerColumn>
          )
        })}
        <View
          className="van-picker__mask"
          style={computed.maskStyle({
            itemHeight,
            visibleItemCount,
          })}
        ></View>
        <View
          className="van-picker__frame van-hairline--top-bottom"
          style={computed.frameStyle({
            itemHeight,
          })}
        ></View>
      </View>
      {toolbarPosition === 'bottom' && showToolbar && (
        <View className="van-picker__toolbar toolbar-class">
          <View
            className="van-picker__cancel"
            hoverClass="van-picker__cancel--hover"
            hoverStayTime={70}
            data-type="cancel"
            onClick={emit}
          >
            {cancelButtonText}
          </View>
          {title && (
            <View className="van-picker__title van-ellipsis">{title}</View>
          )}
          <View
            className="van-picker__confirm"
            hoverClass="van-picker__confirm--hover"
            hoverStayTime={70}
            data-type="confirm"
            onClick={emit}
          >
            {confirmButtonText}
          </View>
        </View>
      )}
    </View>
  )
}