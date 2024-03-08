import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Heading, HStack, Text, View } from '@gluestack-ui/themed';
import Carousel from "react-native-reanimated-carousel";

import VODCard from '../vod/VODCard';
import Spark from '../Spark';

// initialize api engine
const spark = new Spark();

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_API_READ_ACCESS_TOKEN}`
  }
};

const width = Dimensions.get('window').width;
// const width = 1000;
const COUNT = 6;

function TrendingMovies() {
  const [trendingData, setTrendingData] = useState();
  const [movieCount, setMovieCount] = useState();

  useEffect(() => {
    spark.getTrendingMovies()
      .then(response => {
        console.log(response);
        setTrendingData(response)
        setMovieCount(response.length);
      });
  }, []);

  return (
    <>
      {(trendingData && movieCount) &&
        <>
          <View style={{ flex: 1 }}>
            <Carousel
              loop
              width={width / COUNT}
              height={width / 2}
              autoPlay={false}
              style={{width: width}}
              // data={[Object.keys(trendingData)]}
              data={[...new Array(movieCount).keys()]}
              onSnapToItem={(index) => console.log('current index:', index)}
              renderItem={({ index }) => 
                <VODCard key={trendingData[index].id} streamType='movie' mediaID={trendingData[index].stream_id} image={`https://image.tmdb.org/t/p/w400${trendingData[index].poster_path}`} name={trendingData[index].title} />
              }
            />
          </View>
          <HStack space="none" reversed={false} wrap={false}>
            {trendingData.map(trending =>
              <VODCard key={trending.id} streamType='movie' mediaID={trending.stream_id} image={`https://image.tmdb.org/t/p/w400${trending.poster_path}`} name={trending.title} />
            )}
          </HStack>
        </>
      }
    </>
  );
}

const MovieGridSX= {
  display: 'flex',
  justifyContent: 'center'
}

export default TrendingMovies;