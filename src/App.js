import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import List from './components/List'
import Edit from './components/Edit'

// Apollo-Client関連のimport
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { ApolloClient } from 'apollo-client'
import { ApolloProvider } from 'react-apollo-hooks'

export default function App() {

  // キャッシュ
  const cache = new InMemoryCache()

  // GraphQLのエンドポイント
  const httpLink = new HttpLink({
    uri: 'http://localhost:5000/graphql',
  })

  // Apollo-Clientの設定
  const client = new ApolloClient({
    link: httpLink,
    cache,
  })

  // コンポ―ネントをApolloProviderでラップする
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={List} />
          <Route exact path="/edit" component={Edit} />
          <Route path="/edit/:id" component={Edit} />
          <Redirect to="/" />
        </Switch>
      </BrowserRouter>
    </ApolloProvider>
  )
}
