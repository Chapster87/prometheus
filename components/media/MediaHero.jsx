import { useState } from 'react';
import { Link } from 'expo-router';
import { Box, Button, ButtonText, HStack, Heading, Icon, ImageBackground, Text } from '@gluestack-ui/themed';
import { Clapperboard, Library, TrendingUp } from 'lucide-react-native';

function VODHero({ heroMedia }) {
  const [media, setMedia] = useState(heroMedia);
  const [mediaType, setMediaType] = useState(heroMedia.media_type === 'movie' ? 'Movie' : 'Series'); 

  return (
    (media && mediaType) &&
    <Box w="100%" sx={{ aspectRatio: "21 / 9" }}>
      <ImageBackground
        source={{ uri: `https://image.tmdb.org/t/p/original${media.backdrop_path}` }}
        style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', justifyContent: "center", width: '100%', position: "absolute", top: 0, aspectRatio: "16 / 9" }}
      >
        <Box grid="container-fluid">
          <Box grid="row">
            <Box grid="col" columns="5">
              <Box sx={{
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '$6 $4',
                borderRadius: '$sm',
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginBottom: 100
              }}>
                <Text sx={{ display: 'flex', alignItems: 'center', color: '$white', fontSize: '$lg', textTransform: 'uppercase', fontWeight: '$bold' }}>
                  <Icon as={TrendingUp} sx={{ color: '$primary0', marginRight: '$1' }} /> Trending {mediaType}
                </Text>
                <Heading
                  size="4xl"
                  color="$white"
                  fontWeight="$bold"
                  lineHeight={52}
                  textAlign="left"
                  marginBottom="$4"
                >
                  {mediaType === 'Movie' ? media.title : media.name}
                </Heading>
                <Text sx={{ marginBottom: '$8' }}>{media.overview}</Text>
                <HStack>
                  <Link
                    href={{
                      pathname: `/${mediaType === 'Movie' ? 'movies' : 'series'}/${media.stream_id ? media.stream_id : media.id }`,
                      params: { type: media.stream_id ? 'xc' : 'tmdb' }
                    }}
                  >
                    <Button variant="secondary" action="primary" sx={{ backgroundColor: '$white', border: '2px solid $white' }}>
                      <Icon as={Library} sx={{ color: '$primary0', marginRight: '$2' }} />
                      <ButtonText sx={{ color: '$primary0' }}>{mediaType} Info</ButtonText>
                    </Button>
                  </Link>
                  {(media.stream_id) && 
                    <Link 
                      href={{
                        pathname: `/${mediaType === 'Movie' ? 'movies' : 'series'}/${media.stream_id}`,
                        params: { type: 'xc' }
                      }}
                      style={{ marginLeft: 24 }}
                    >
                      <Button action="primary" variant="gradient">
                        <Icon as={Clapperboard} sx={{ color: '$white', marginRight: '$2' }} />
                        <ButtonText>Watch Now</ButtonText>
                      </Button>
                    </Link>
                  }
                </HStack>
              </Box>
            </Box>
          </Box>
        </Box>
      </ImageBackground>
    </Box>
  );
}

export default VODHero;