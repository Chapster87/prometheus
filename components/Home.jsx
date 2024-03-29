import { useState, useEffect } from 'react';
import Head from 'expo-router/head';
import { Box, View } from "@gluestack-ui/themed";

import MediaHero from './media/MediaHero'
import MediaRow from './media/MediaRow'
import Spark from './Spark';
import DummyHero from './dummies/DummyHero';
import DummyRow from './dummies/DummyRow';

function App({ session }) {
  const [heroMedia, setHeroMedia] = useState();
  const [trendingMovies, setTrendingMovies] = useState();
  const [trendingSeries, setTrendingSeries] = useState();
  const [account, setAccount] = useState(session);

  // initialize api engine
  const spark = new Spark(session);

  useEffect(() => {
    if(session || process.env.EXPO_PUBLIC_USE_ENV === 'true') {
      setAccount(session);
      const fetchMovies = spark.getTrendingMovies()
        .then(response => {
          // console.log(response);
          setTrendingMovies(response);
          return response;
        });

      const fetchSeries = spark.getTrendingSeries()
        .then(response => {
          // console.log(response);
          setTrendingSeries(response);
          return response;
        });

      Promise.all([fetchMovies, fetchSeries])
        .then((values) => {
          if(values && values.length > 1 && values[0] && values[1]) {
            const allTrending = values[0].concat(values[1]);

            if (allTrending.length > 0) {
                const random = Math.floor(Math.random() * allTrending.length);
                const randomMedia = allTrending[random];
                setHeroMedia(randomMedia);
            }
          }
        });
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>Home | Prometheus</title>
      </Head>
      <View sx={{ marginTop: -90 }}>
        {(heroMedia) ? <MediaHero heroMedia={heroMedia} /> : <DummyHero />}
        <Box grid="container-fluid">
          <Box grid="row">
            <Box grid="col" columns="12">
              {/* <TrendingMovies /> */}
              {(trendingMovies) ? 
                <MediaRow title="Trending Movies" mediaData={trendingMovies} mediaType='movies' xcEnabled={account.user.user_metadata.xcUrl} />
              :
                <DummyRow title="Trending Movies" />
              }
            </Box>
          </Box>
          <Box grid="row">
            <Box grid="col" columns="12">
              {(trendingSeries) ?
                <>
                  <MediaRow title="Trending Series" mediaData={trendingSeries} mediaType='series' xcEnabled={account.user.user_metadata.xcUrl} />
                </>
              :
                <DummyRow title="Trending Series" />
              }
            </Box>
          </Box>
        </Box>
      </View>
    </>
  );
}

export default App;