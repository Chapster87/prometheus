import { useState, useEffect, useContext, useRef } from 'react';
import Head from 'expo-router/head';
import { AuthContext } from '../../components/session/AuthContext';
import { useLocalSearchParams, Link } from 'expo-router';

import { Badge, BadgeText, Box, Heading, HStack, Icon, Image, ImageBackground, LinkText, View, Text, VStack } from '@gluestack-ui/themed';
import { Dot } from 'lucide-react-native';

import Spark from '../../components/Spark';
import VideoJS from '../../components/VideoJS'
import FavoriteBadge from '../../components/badges/Favorite';
import WatchedBadge from '../../components/badges/Watched';
import TmdbShortSvg from '../../components/svgs/TmdbShort';

import { minutesToHrs } from '../../utils/utils';

export default function Page() {
  const [session, setSession] = useContext(AuthContext);
  const { id, type } = useLocalSearchParams();
  const [movieData, setMovieData] = useState();
  // const [watchHistory, setWatchHistory] = useState();
  const [xcData, setXcData] = useState();

  // initialize api engine
  const spark = new Spark(session);
  
  useEffect(() => {
    if (session || process.env.EXPO_PUBLIC_USE_ENV === 'true') {
      if(type === 'tmdb') {
        spark.getTmdbMovie(id)
          .then(data => {
            setMovieData(data);
            console.log("TMDB Data", data);
          });
      } else if(spark.config.xcUrl) {
        const fetchXcInfo = spark.getVODInfo(id)
          .then(data => {
            // http(s)://domain:port/movie/username/password/streamID.ext
            const streamUrl = `${spark.config.xcUrl}/movie/${spark.config.xcAuth.username}/${spark.config.xcAuth.password}/${data.movie_data.stream_id}.${data.movie_data.container_extension}`;
            
            data.movie_data.stream_url = streamUrl;

            setXcData(data);
            console.log("XC Data", data);
            return data;
          });

          Promise.all([fetchXcInfo])
            .then((value) => {
              const tmdbID = value[0].info.tmdb_id;
              if(tmdbID) {
                spark.getTmdbMovie(tmdbID)
                  .then(data => {
                    setMovieData(data);
                    console.log("XC TMDB Data", data);
                  });
              }
            });
      }
    }
  }, [session]);

  const playerRef = useRef(null);

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on('waiting', () => {
      videojs.log('player is waiting');
    });

    player.on('dispose', () => {
      videojs.log('player will dispose');
    });
  };

  return (
    <>
      {/* May be better to define a dummy data object and then replace than checking to see if it's there and rendering on the second page load */}
      {(movieData) &&
        <>
          <Head>
            <title>{`${movieData.title} (${movieData.release_date.substr(0,4)})`} | Prometheus</title>
          </Head>
          <View style={{
            display: 'block',
            width: '100%',
            marginTop: -90
          }}>
            <ImageBackground
              source={{ uri: `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`}}
              style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', justifyContent: "flex-start", width: '100%', position: "absolute", top: 0, aspectRatio: "16 / 9" }}
            >
              <Box grid='container'
                style={{ marginTop: 130, background: 'rgba(0, 0, 0, 0.7)', padding: 30 }}
              >
                {(xcData) &&
                  <Box grid='row'>
                    <Box grid='col' columns='12'>
                      {/* <p><video src={xcData.movie_data.stream_url} type='video/x-matroska; codecs="theora, vorbis"' controls ></video></p> */}
                      <VideoJS options={{
                        autoplay: false,
                        controls: true,
                        responsive: true,
                        fluid: true,
                        sources: [{
                          src: xcData.movie_data.stream_url,
                          type: 'video/mp4'
                        }]}}
                        onReady={handlePlayerReady} 
                      />
                    </Box>
                  </Box>
                }
                <Box grid='row'>
                  <Box grid='col' columns='12' columnsMd='3' sx={{ display: 'flex' }}>
                    <Image
                      borderRadius="$none"
                      alt={movieData.title}
                      sx={{ width: '100%', height: 'auto', aspectRatio: '2/3' }}
                      source={{
                        uri: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
                      }}
                    />
                    <WatchedBadge session={session} mediaID={movieData.id} mediaType={'movie'} />
                  </Box>
                  <Box grid='col' columns='12' columnsMd='9' sx={{ position: 'relative' }}>
                    <Box grid='row'>
                      <Box grid='col' columns='12'>
                        <HStack>
                          <Heading size='3xl'>{movieData.title}</Heading>
                        </HStack>
                        <HStack  sx={{ alignItems: 'center', marginBottom:'$2' }}>
                          {movieData.release_date && 
                            <Text>{movieData.release_date.substr(0,4)}</Text>
                          }
                          {(movieData.release_date && movieData.runtime) &&
                            <Icon as={Dot} size='35' sx={{ color: '$white' }} />
                          }
                          {movieData.runtime &&
                            <Text>{minutesToHrs(movieData.runtime)}</Text>
                          }
                          {(movieData.runtime && movieData.certification_rating) &&
                            <Icon as={Dot} size='35' sx={{ color: '$white' }} />
                          }
                          {movieData.certification_rating && 
                            <Badge action="rating" borderRadius="$none">
                              <BadgeText sx={{ textTransform: 'uppercase' }}>{movieData.certification_rating}</BadgeText>
                            </Badge>
                          }
                          {(movieData.certification_rating && movieData.status) &&
                            <Icon as={Dot} size='35' sx={{ color: '$white' }} />
                          }
                          {movieData.status &&
                            <Badge size="md" variant="solid" borderRadius="$none" action="success" sx={badgeStyles}>
                              <BadgeText>Status: {movieData.status}</BadgeText>
                            </Badge>
                          }
                        </HStack>
                        <Box sx={{ marginBottom:'$3' }}><Text>
                          {movieData.genres.map((genre, index, genres) => {
                            let output = genre.name;
                            if (index + 1 !== genres.length) {
                              output += ' · '
                            }
                            return output;
                          })}
                        </Text></Box>
                        <HStack  sx={{ alignItems: 'center', marginBottom:'$3' }}>
                          {movieData.vote_average &&
                            <Box sx={{ backgroundColor: '#0d253f', flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 4 }}>
                              <TmdbShortSvg height={28}/>
                              <Text sx={{ fontFamily: '$rating', fontSize: 20, marginLeft: 12 }}>{ Math.round(movieData.vote_average * 10) / 10}</Text>
                            </Box>
                          }
                        </HStack>
                        <VStack space="md" reversed={false}>
                          {(movieData.tagline) && <Box><Text>"{movieData.tagline}"</Text></Box>}
                          {(xcData) && <Box><Text>{xcData.movie_data.stream_url}</Text></Box>}
                          <Box><Text>{movieData.overview}</Text></Box>
                          <Box><Text><Text sx={{ fontWeight: '$bold' }}>Cast:</Text> NEED</Text></Box>
                          {(movieData.homepage) && <Box><Link href={movieData.homepage} target={'_blank'} rel={'noopener noreferrer'}><LinkText>{movieData.homepage}</LinkText></Link></Box>}
                        </VStack>
                        <FavoriteBadge session={session} mediaID={movieData.id} mediaType={'movie'} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </ImageBackground>
          </View>
        </>
      }
    </>
  );
}

const badgeStyles = {
  paddingVertical: 5,
  paddingHorizontal: 12,
  border: 0,
  zIndex: 10
}