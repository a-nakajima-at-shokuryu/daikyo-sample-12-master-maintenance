import React, { useState } from 'react'
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
  IconButton,
  TextField,
} from '@material-ui/core'
import { blue } from '@material-ui/core/colors'
import { makeStyles } from '@material-ui/core/styles'
import MUIDataTable from 'mui-datatables'
import CreateIcon from '@material-ui/icons/Create';

// GraphQL関連のimport
import gql from 'graphql-tag'

// Apollo-Client関連のimport
import { useQuery, useMutation } from 'react-apollo-hooks'

// Material-UIのスタイル設定
const useStyles = makeStyles({
  root: {
    padding: '20px',
    minWidth: '100%',
  }
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

// データ削除mutation
const DEL_BUSHO = gql`
  mutation delData($id: String!) {
    delBusho(id: $id) {
      id
      name
    }
  }
`

// 全体（親）
const List = (props) => { 

  const classes = useStyles()

  // Material-UIのテーマ設定
  // カラーの設定
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: blue[700]
      },
    }, 
  })

  // ステートフック
  const [searchBushoId, setSearchBushoId] = useState("")

  // 新規登録ボタンクリック時
  const doClickNewButton = () => {
    props.history.push('/edit')
  }

  // 検索処理実行
  // 子コンポーネント（<Search>）から呼ばれる
  const doSearch = (data) => {
    setSearchBushoId(data)
  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <FormControl className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">
              部署一覧
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Search doSearch={doSearch} />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={e => doClickNewButton()}>新規登録</Button>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
              <Meisai props={props} searchBushoId={searchBushoId} />
          </Grid>
        </Grid>
      </FormControl>
    </MuiThemeProvider>
  )

}


// 検索部
const Search = ({doSearch, doNewData}) => {

  const classes = useStyles()

  // Material-UIのテーマ設定
  // カラーの設定
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: blue[700]
      },
    }, 
  })

  // ステートフック
  const [bushoId, setBushoId] = useState("")

  // テキスト変更時
  const doChangeBushoId = (e) => {
    setBushoId(e.target.value)
  }
  
  // 検索ボタンクリック時
  const doClickSearchButton = () => {
    // 親のdoSearch関数を呼び出す
    doSearch(bushoId)
  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <FormControl className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField value={bushoId} id="busho-id" label="部署コード条件" onChange={e => doChangeBushoId(e)} />
            &nbsp;&nbsp;
            <Button variant="contained" onClick={e => doClickSearchButton()}>検索</Button>
          </Grid>
        </Grid>
      </FormControl>
    </MuiThemeProvider>
  )
}


// 明細部
const Meisai = ({props, searchBushoId}) => {

  // useMutaion
  // 実行されたらリフェッチする
  const [delBusho] = useMutation(DEL_BUSHO, {
    update: (cache, response) => {
      refetch()
    }
  })

  // 編集ボタンクリック時
  const doClickEditButton = (tableMeta) => {
    const id = tableMeta.rowData[0]
    props.history.push('/edit/' + id)
  }
  
  // DataTableの列定義
  const columns = [
    {
      name: 'id', label: '部署ID', 
      options: {
        sort: true, 
        filter: true,
      }, 
    }, 
    {
      name: 'name', label: '部署名', 
      options: {
        sort: true, 
        filter: true,
      }, 
    }, 
    {
      name: "Edit",
      options: {
        filter: false,
        sort: false,
        empty: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <IconButton aria-label="Edit" onClick={() => doClickEditButton(tableMeta)}>
              <CreateIcon />
            </IconButton>
          )
        }
      }
    },
  ]

  // DataTableのオプション
  const options = {
    selectableRows: 'single',
    onRowsDelete: (rowsDeleted, data) => {
      const dataIndex = rowsDeleted.data[0].dataIndex
      const id = datas[dataIndex].id
      const name = datas[dataIndex].name
      const msg =
      "部署ID: " + id + "\n" +
      "部署名: " + name + "\n" +
      "を削除します。よろしいですか？"
      if (window.confirm(msg)) {
        // データ削除
        delBusho({
          variables: {
           'id': id,
          }
        })
      }
      return false
    },
  }

  // クエリのvariablesを生成
  let queryVariabled = {}
  if (searchBushoId !== '') {
    queryVariabled = {
      'id': searchBushoId
    }
  }

  // データ取得
  // fetchPolicy: 'cache-and-network' を指定することで、
  // 画面遷移が起こったタイミングで、キャッシュorネットワークからデータを取得して再表示する
  const { loading, error, data, refetch } = useQuery(GET_BUSHO, {
    fetchPolicy: 'cache-and-network',
    variables: queryVariabled,
  })

  // メモ：数秒おきにデータを自動取得する場合
  // const { loading, error, data } = useQuery(GET_BUSHO, {pollInterval: 1000})

  // 通信状態に応じたコンポーネントを表示
  if (loading) return <p>Loading...</p>
  if (error)   return <p>Error: {error}</p>

  const datas = data.busho

  return (
    <MUIDataTable
      data={datas}
      columns={columns}
      options={options}
    />
  )

}

export default withRouter(List)
