import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'

// Material-UI関連のimport
import {
  createMuiTheme, 
  MuiThemeProvider, 
  CssBaseline, 
  Grid,
  Typography,
  FormControl,
  Button,
  TextField,
} from '@material-ui/core'
import { blue } from '@material-ui/core/colors'
import { makeStyles } from '@material-ui/core/styles'

// GraphQL関連のimport
import gql from 'graphql-tag'

// Apollo-Client関連のimport
import { useQuery, useMutation } from 'react-apollo-hooks'

// Material-UIのスタイル設定
const useStyles = makeStyles({
  root: {
    padding: '20px',
    minWidth: '100%',
  },
})

// データ取得クエリ
const GET_BUSHO = gql`
  query getData($id: String) {
    busho(id: $id) {
      id
      name
    }
  }
`

// データ追加mutation
const ADD_BUSHO = gql`
  mutation addData($id: String! $name: String!) {
    addBusho(id: $id name: $name) {
      id
      name
    }
  }
`

// データ更新mutation
const UPD_BUSHO = gql`
  mutation updData($id: String! $name: String!) {
    updBusho(id: $id name: $name) {
      id
      name
    }
  }
`

// 全体（親）
const Edit = (props) => {

  // React Router パラメータを取得
  const {params} = props.match

  // ステートフック
  const [iniData, setIniData] = useState({})

  // setIniData変更
  // 子コンポーネント（<LoadData>）から呼ばれる
  const doSetIniData = (data) => {
    setIniData(data)
  }

  return (
    <>
      <LoadData params={params} doSetIniData={doSetIniData} />
      <InputData props={props} iniData={iniData} />
    </>
  )

}

// データ取得
const LoadData = ({params, doSetIniData}) => {

  // クエリのvariablesを生成
  let queryVariables = {}
  if (params.id !== undefined) {
    // パラメータが渡っていたら、その値でvariablesを生成
    queryVariables = {
      'id': params.id
    }
  } else {
    // パラメータが渡っていなければ、ダミー値でvariablesを生成
    queryVariables = {
      'id': '^'
    }
  }
  // console.log(queryVariables)

  // データ取得
  const { loading, error, data } = useQuery(GET_BUSHO, {
    variables: queryVariables,
  })

  // データが取得されたら実行
  // （第２引数の値に変化があった場合のみ第１引数の関数を実行）
  useEffect(() => {
    if (data) {
      const datas = data.busho
      if (datas.length === 0) {
        // 取得データ無し：新規登録
        // 特に実行する処理なし
      } else {
        // 取得データあり：修正
        // 親のdoSetIniData関数を呼び出す
        const iniData = {
          'id': datas[0].id,
          'name': datas[0].name
        }
        doSetIniData(iniData)
      }
    }
  }, [data])
  
  // 通信状態に応じたコンポーネントを表示
  if (loading) return <p>Loading...</p>
  if (error)   return <p>Error: {error}</p>

  return <></>

}


// 入力項目
const InputData = ({props, iniData}) => {

  const classes = useStyles()

  // Material-UIのテーマ設定
  // primaryカラーの設定
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: blue[700]
      }
    }, 
  })

  // ステートフック
  const [bushoId, setBushoId] = useState("")
  const [bushoName, setBushoName] = useState("")
  const [errBushoId, setErrBushoId] = useState(false)
  const [errBushoName, setErrBushoName] = useState(false)
  const [helperTextBushoId, setHelperTextBushoId] = useState("")
  const [helperTextBushoName, setHelperTextBushoName] = useState("")
  const [disabledBushoId, setDisabledBushoId] = useState(false)

  // データが取得されたら実行
  // （第２引数の値に変化があった場合のみ第１引数の関数を実行）
  useEffect(() => {
    if (iniData.id !== undefined) {
      // id値が空でないとき（＝編集モード）
      setBushoId(iniData.id)
      setBushoName(iniData.name)
      setDisabledBushoId(true)
    }
  }, [iniData])

  // useMutaion
  // 実行されたら一覧へ遷移する
  const [addBusho] = useMutation(ADD_BUSHO, {
    update: (cache, response) => {
      props.history.push('/list')
    }
  })
  const [updBusho] = useMutation(UPD_BUSHO, {
    update: (cache, response) => {
      props.history.push('/list')
    }
  })

  // テキスト変更時
  const doChangeBushoId = (e) => {
    setBushoId(e.target.value)
  }
  const doChangeBushoName = (e) => {
    setBushoName(e.target.value)
  }

  // 一覧に戻るボタンクリック時
  const doClickBackButton = () => {
    props.history.push('/list')
  }

  // 登録ボタンクリック時
  const doClickSubmitButton = () => {

    let errFlg = false

    // 一旦エラー状態を解除
    setErrBushoId(false)
    setErrBushoName(false)
    setHelperTextBushoId('')
    setHelperTextBushoName('')

    // 入力チェック
    // ★ここでやらずにAPIでチェックさせてmutationの戻り値で制御してもよいかも
    if (bushoId === '') {
      setErrBushoId(true)
      setHelperTextBushoId('入力してください')
      errFlg = true
    }
    if (bushoName === '') {
      setErrBushoName(true)
      setHelperTextBushoName('入力してください')
      errFlg = true
    }

    // エラー無しならば
    if (errFlg === false) {

      // 部署IDのdisabled状態によって分岐
      // 入力可⇒新規登録モード
      // 入力不可⇒修正モード
      if (disabledBushoId === false) {

        // データ登録
        addBusho({
          variables: {
            'id': bushoId,
            'name': bushoName
          }
        })

      } else {

        // データ更新
        updBusho({
          variables: {
            'id': bushoId,
            'name': bushoName
          }
        })
        
      }

    }

  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <FormControl className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">
              部署編集
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button variant="contained" onClick={e => doClickBackButton()}>一覧に戻る</Button>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField required disabled={disabledBushoId} error={errBushoId} helperText={helperTextBushoId} value={bushoId} onChange={e => doChangeBushoId(e)} id="busho-id" label="部署コード" />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField required error={errBushoName} helperText={helperTextBushoName} value={bushoName} onChange={e => doChangeBushoName(e)} id="busho-name" label="部署名" />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={e => doClickSubmitButton()}>登録</Button>
          </Grid>
        </Grid>
      </FormControl>
    </MuiThemeProvider>
  )

}

export default withRouter(Edit)