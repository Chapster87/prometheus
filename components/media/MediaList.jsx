import { useState, useEffect } from 'react';
import { StyleSheet} from 'react-native';
import { Box, Button, ButtonText, Heading, Icon, Text } from '@gluestack-ui/themed';
import { ArrowLeft, ArrowLeftToLine, ArrowRight, ArrowRightToLine } from 'lucide-react-native';
const paginate = require('paginate-array');

import MediaCard from './MediaCard';
import DummyCard from '../dummies/DummyCard';

function MediaList({page, spark, session, catId, catName}) {
  const [account, setAccount] = useState(session);
  const [VODCatData, setVODCatData] = useState();
  const [mediaData, setMediaData] = useState({ data: [], size: 50, page: 1, currPage: null });
  const [mediaType, setMediaType] = useState(page === 'Movies' ? 'movie' : 'tv');
  const [VodID, setVodID] = useState();
  const [isTmdb, setIsTmdb] = useState(false);

  useEffect(() => {
    if (session || process.env.EXPO_PUBLIC_USE_ENV === 'true') {
      if(session.user.user_metadata.xcUrl) {
        if(page === 'Series') {
          // GET Series Streams
          {account.user.user_metadata.xcUrl && 
            spark.getSeriesStreams(catId)
              .then((series) => {
                // console.log(series);
                const data = series.data;
                // setVODCatData(series.data)
                const { page, size } = mediaData;
                const currPage = paginate(data, page, size);
                setMediaData({ ...mediaData, data: series.data, currPage: currPage });
              });
          }
        } else if (page === 'Movies') {
          // GET Movie Streams
          {account.user.user_metadata.xcUrl && 
            spark.getVODStreams(catId)
              .then(movies => {
                // console.log(movies);
                const data = movies.data;
                // setVODCatData(movies.data)
                const { page, size } = mediaData;
                const currPage = paginate(data, page, size);
                setMediaData({ ...mediaData, data: movies.data, currPage: currPage }); 
              });
          }
        }
      } else if(session.user.user_metadata.tmdbApiKey && session.user.user_metadata.tmdbApiReadAccessToken) {
        setIsTmdb(true);
        if(page === 'Series') {
          spark.getTmdbSeriesByGenres(catId)
            .then(movies => {
              console.log("Series By Genre", movies);
              const data = movies.results;
              const page = movies.page;
              const size = movies.results.length;
              const currPage = paginate(data, page, size);
              setMediaData({ ...mediaData, data: data, currPage: currPage }); 
              console.log(currPage);
            });
        } else if (page === 'Movies') {
          console.log("Movies");
          spark.getTmdbMoviesByGenres(catId)
            .then(movies => {
              // console.log("Movies By Genre", movies);
              const data = movies.results;
              const page = movies.page;
              const size = movies.results.length;
              const currPage = paginate(data, page, size);
              setMediaData({ ...mediaData, data: data, currPage: currPage }); 
              console.log(currPage);
            });
        }
      }
    }
  }, [session])

  function firstPage() {
    const { page, size, data } = mediaData;

    if (page !== 1) {
      const newPage = 1;
      const newCurrPage = paginate(data, newPage, size);

      setMediaData({ ...mediaData, page: newPage, currPage: newCurrPage });
    }
  }

  function previousPage() {
    const { page, size, data } = mediaData;

    if (page > 1) {
      const newPage = page - 1;
      const newCurrPage = paginate(data, newPage, size);

      setMediaData({ ...mediaData, page: newPage, currPage: newCurrPage });
    }
  }

  function nextPage() {
    const { currPage, page, size, data } = mediaData;

    if (page < currPage.totalPages) {
      const newPage = page + 1;
      const newCurrPage = paginate(data, newPage, size);
      console.log('newPage', newPage);
      setMediaData({ ...mediaData, page: newPage, currPage: newCurrPage });
    }
  }

  function lastPage() {
    const { currPage, page, size, data } = mediaData;

    if (page !== currPage.totalPages) {
      const newPage = currPage.totalPages;
      const newCurrPage = paginate(data, newPage, size);

      setMediaData({ ...mediaData, page: newPage, currPage: newCurrPage });
    }
  }

  return (
    <>
      {(!VodID) &&
        <Box grid='container-fluid'>
          <Box grid='row'>
            <Box grid='col' columns='12'>
              <Heading type="h1-neon" neon={page === 'Movies' ? 'red': 'orange'} sx={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 20, marginBottom: 12 }}>{page}</Heading>
              <Heading type="h2-neon" neon="white" sx={{ display: 'block', width: '100%', textAlign: 'center', marginBottom: 30 }}>- {catName} -</Heading> 
            </Box>
          </Box>
          <Box grid='row' sx={{ marginBottom: 30 }}>
            {/* {(VODCatData) ?
              VODCatData.map(vod => {
                const isSeries = (vod.stream_type === 'series');
                const mediaID = isSeries ? vod.series_id : vod.stream_id;
                const mediaImg = isSeries ? vod.cover : vod.stream_icon;

                return (
                  <MediaCard key={mediaID} mediaID={mediaID} streamType={vod.stream_type} name={vod.name} image={mediaImg} />
                );
              })
            : */}
            {(mediaData && mediaData.currPage && mediaData.currPage.data) ?
              <>
                {mediaData.currPage.data.map(vod => {
                  const isSeries = (mediaType === 'tv');
                  let mediaID;
                  let mediaImg;
                  let mediaName;
                  if(isTmdb) {
                    mediaID = vod.id;
                    mediaName = isSeries ? vod.name : vod.title;
                    mediaImg = `https://image.tmdb.org/t/p/w400${vod.poster_path}`;
                  } else {
                    mediaID = isSeries ? vod.series_id : vod.stream_id;
                    mediaName = vod.name;
                    mediaImg = isSeries ? vod.cover : vod.stream_icon;
                  }

                  return (
                    <Box grid="col" columns="6" columnsMd="4" columnsLg="3" columnsXl="2" sx={{ marginBottom: 24 }} key={mediaID}>
                      {!isTmdb ? (
                        <MediaCard mediaID={mediaID} streamType={mediaType} name={mediaName} image={mediaImg} session={session ? session : null}/>
                      ) : (
                        <MediaCard tmdbID={mediaID} streamType={mediaType} name={mediaName} image={mediaImg} session={session ? session : null}/>
                      )}
                    </Box>
                  );
                })}
              </>
            :
              [...Array(18)].map((elementInArray, index) =>
                <Box grid="col" columns="6" columnsMd="4" columnsLg="3" columnsXl="2" sx={{ marginBottom: 24 }} key={index}>
                  <DummyCard />
                </Box>
              )
            }
          </Box>
          {(mediaData && mediaData.currPage && mediaData.currPage.data && mediaData.currPage.totalPages > 1) &&
            <Box grid='row' sx={{ width: '100%', background: 'rgba(0, 0, 0, 0.6)', position: 'fixed', bottom: 0, paddingVertical: 14 }}>
              <Box grid='col' columns='12' sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Button variant="gradient" onPress={firstPage} sx={{ marginRight: '$3' }}>
                  <Icon as={ArrowLeftToLine} sx={{ color: '$white', marginRight: '$2'}} />
                  <ButtonText>First</ButtonText>
                </Button>
                <Button variant="gradient" onPress={previousPage}>
                  <Icon as={ArrowLeft} sx={{ color: '$white', marginRight: '$2'}} />
                  <ButtonText>Previous Page</ButtonText>
                </Button>
                <Box sx={{ marginHorizontal: '$6' }}><Text>{mediaData.currPage.currentPage} / {mediaData.currPage.totalPages} | {mediaData.currPage.perPage} per page</Text></Box>
                <Button variant="gradient" onPress={nextPage}>
                  <ButtonText>Next Page</ButtonText>
                  <Icon as={ArrowRight} sx={{ color: '$white', marginLeft: '$2' }} />
                </Button>
                <Button variant="gradient" onPress={lastPage} sx={{ marginLeft: '$3' }}>
                  <ButtonText>Last</ButtonText>
                  <Icon as={ArrowRightToLine} sx={{ color: '$white', marginLeft: '$2' }} />
                </Button>
              </Box>
            </Box>
          }
        </Box>
      }
    </>
  )
}

export default MediaList;