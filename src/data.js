const express = require('express')
const express_graphql = require('express-graphql')
const { buildSchema } = require('graphql')

// FileStreamモジュールの読込
const fs = require('fs')

// スキーマの定義
const schema = buildSchema(`

    # Queryスキーマ
    type Query {
        busho(id: String): [Busho]
    }

    # Mutationスキーマ
    type Mutation {
        addBusho(id: String! name: String!): [Busho]
        updBusho(id: String! name: String!): [Busho]
        delBusho(id: String!): [Busho]
    }
  
    # 部署スキーマ
    type Busho {
        id: String
        name: String
    }

`)

const root = {

    // SELECT
    busho: args => {

        // 引数を変数に格納
        const id = args.id

        // jsonファイルの読込
        const jsonpath = __dirname + '\\busho.json'
        let dat = JSON.parse(fs.readFileSync(jsonpath, 'utf8'))

        // idが指定されていたら、フィルタリング
        if (id !== undefined) {
            dat = dat.filter(item => item.id === id)
        }

        return dat
    },

    // INSERT
    addBusho: args => {

        // 引数を変数に格納
        const id = args.id
        const name = args.name

        // jsonファイルの読込
        const jsonpath = __dirname + '\\busho.json'
        let dat = JSON.parse(fs.readFileSync(jsonpath, 'utf8'))

        // 新しい要素を追加
        // すでに同じid値が存在したら追加しない
        const flg = dat.filter(item => item.id === id)
        if (flg.length > 0) return dat
        const tmp = {
            "id": id,
            "name": name
        }
        dat.push(tmp)

        // jsonファイルの書き込み
        fs.writeFileSync(jsonpath, JSON.stringify(dat))

        // 追加後の全データを返却する
        return dat

    },

    // UPDATE
    updBusho: args => {

        // 引数を変数に格納
        const id = args.id
        const name = args.name

        // jsonファイルの読込
        const jsonpath = __dirname + '\\busho.json'
        let dat = JSON.parse(fs.readFileSync(jsonpath, 'utf8'))

        // idに一致するnameを書き換える
        dat = dat.map(function(item) {
            if (item.id === id) item.name = name
            return item
        })

        // jsonファイルの書き込み
        fs.writeFileSync(jsonpath, JSON.stringify(dat))

        // 更新後の全データを返却する
        return dat

    },

    // DELETE
    delBusho: args => {

        // 引数を変数に格納
        const id = args.id

        // jsonファイルの読込
        const jsonpath = __dirname + '\\busho.json'
        let dat = JSON.parse(fs.readFileSync(jsonpath, 'utf8'))

        // idに一致する要素を削除する
        dat = dat.filter(item => item.id !== id)

        // jsonファイルの書き込み
        fs.writeFileSync(jsonpath, JSON.stringify(dat))

        // 削除後の全データを返却する
        return dat
    
    }
    
}
  
const app = express()

// クロスドメイン対応
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, access_token'
    )
    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
        res.send(200)
    } else {
        next()
    }
}
app.use(allowCrossDomain)

app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}))
  
app.listen(5000, () => console.log('Example app listening on port 5000!'))
