import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, Linking, RefreshControl } from 'react-native';

import moment from 'moment';
import { Card, Button,Icon } from 'react-native-elements';

const ListEmpty = () => {
  return(
    <View>
      <Text>Empty List</Text>
    </View>
  )
};

const onPress = url => {
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      console.log(`Don't know how to open URL: ${url}`);
    }
  });
};

const filterForUniqueArticles = arr => {
  const cleaned = [];
  arr.forEach(itm => {
    let unique = true;
    cleaned.forEach(itm2 => {
      const isEqual = JSON.stringify(itm) === JSON.stringify(itm2);
      if (isEqual) unique = false;
    });
    if (unique) cleaned.push(itm);
  });
  return cleaned;
};

export default function App() {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [articles, setArticles] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [lastPageReached, setLastPageReached] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getNews = async () => {
    setLoading(true);
    if (lastPageReached) return;
    console.log("getNews");
    const API_KEY = "36b5dcd8b0ac488286f6c90c4528b8c4";
    const url = 'http://newsapi.org/v2/top-headlines?' +
            'country=us&' +
            `apiKey=${API_KEY}&page=${pageNumber}`;
    try {
      const response = await fetch(
        url
        );
      const jsonData = await response.json();
      if(jsonData.articles.length) {
        const newArticleList = filterForUniqueArticles(
          articles.concat(jsonData.articles));
        setArticles(newArticleList);
        setPageNumber(pageNumber + 1);
      } else {
        setLastPageReached(true);
      }
      setLoading(false);
    } 
    catch (error) {
      setError(true);
      setLoading(false);
    } 
  };

  const onRefresh = useCallback(async () => { 
    // useCallback onrefresh chỉ cập nhật giá trị mới khi refreshing thay đổi 
    // => prop được truyền vào RefreshControl không bị thay đổi
    console.log("onRefresh");
    setPageNumber(pageNumber + 1);
    setRefreshing(true);
    const API_KEY = "36b5dcd8b0ac488286f6c90c4528b8c4";
    const url = 'http://newsapi.org/v2/top-headlines?' +
            'country=us&' +
            `apiKey=${API_KEY}&page=${pageNumber}`;
    if (articles.length < 30) {
      try {
        let response = await fetch(
          url
        );
        let jsonData = await response.json();
        const newArticleList = filterForUniqueArticles(
          jsonData.articles.concat(articles));
        setArticles(newArticleList);
        setRefreshing(false)
      } catch (error) {
        console.error(error);
      }
    }
    else{
      setRefreshing(false);
      setLastPageReached(true);
    }
  }, [articles]);

  useEffect(() => {
    getNews();
  }, []);

  if(error) {
    return (
      <View style={styles.container}>
        <Text>Server Error</Text>
      </View>
    );
  }

  const renderArticleItem = ({ item }) => {
    if(item){
      return (
        <Card title={item?.title ? item.title : "Null"} image={{ uri: item.urlToImage ? item.urlToImage : "NULL" }}>
          <View style={styles.row}>
            <Text style={styles.label}>Source</Text>
            <Text style={styles.info}>{item?.source?.name}</Text>
          </View>
          <Text style={{ marginBottom: 10 }}>{item.content ? item.content : "NULL"}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Published</Text>
            <Text style={styles.info}>
              {moment(item.publishedAt).format('LLL')}
            </Text>
          </View>
          <Button icon={<Icon />} title="Read more" backgroundColor="#03A9F4" onPress={() => onPress(item.url)}/>
        </Card>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Articles Count:</Text>
        <Text style={styles.info}>{articles.length}</Text>
      </View>
      <FlatList
        data={articles}
        renderItem={renderArticleItem}
        keyExtractor={item => item.title}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={getNews} 
        onEndReachedThreshold={1}
        ListEmptyComponent={ListEmpty}
        ListHeaderComponent={ lastPageReached && <Text style={[styles.label, {textAlign: "center", marginTop: 6,}]}>Don't have news</Text> }
        ListFooterComponent={ lastPageReached ? <Text style={[styles.label, {textAlign: "center", marginTop: 6,}]}>LastPageReached</Text> : loading && <ActivityIndicator size="large"/>}
      /> 
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  header: {
    height: 30,
    width: '100%',
    backgroundColor: 'pink'
  },
  row: {
    flexDirection: 'row'
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginRight: 10,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 16,
    color: 'grey'
  }
});

