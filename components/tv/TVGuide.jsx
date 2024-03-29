import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Box, Heading, Text } from '@gluestack-ui/themed';

const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

let currTime = Date.now()

function TVGuide({ page, spark, session, catId, catName }) {
  const [channels, setChannels] = useState();

  useEffect(() => {
    if (session || process.env.EXPO_PUBLIC_USE_ENV === 'true') {
      // spark.getLiveGuide(catId)
      //   .then(data => console.log("TV Guide", data))

      spark.getLiveGuide(catId)
        .then(data => setChannels(data));
    }
    
  }, [session]);

  return (
    <>
      {/* Needs dummy content */}
      {(channels) &&
        <Box grid='container-fluid'>
          <Box grid='row'>
            <Box grid='col' columns='12'>
              <Heading size='3xl'>{page} - {catName}</Heading>
            </Box>
          </Box>
          <Box grid='row'>
            <Box grid='col' columns='12'>
              <div>{new Date(currTime * 1000).toString()}</div>
              <div>{date.toLocaleTimeString('en-US')}</div>
            </Box>
          </Box>
          <Box grid='row'>
            <Box grid='col' columns='12'>
              {channels.map(channel => 
                <Box style={{ ...styles.channel }} key={channel.num}>
                  <Box style={{ ...styles.channelInner }}>
                    <Box style={{ ...styles.channelNameCard }} bg='$warmGray200'>
                      <img style={{ ...styles.channelIcon }} src={channel.stream_icon} />
                      <Text style={{ ...styles.channelTitle }}>{channel.name}</Text>
                    </Box>
                    <Box style={{ ...styles.programList }}>
                      {channel.epg_listings.map(epg => {
                          const guideWidthMinutes = 120;
                          const programLengthMinutes = (epg.stop_timestamp - epg.start_timestamp)/60;
                          const programWidth = (programLengthMinutes / guideWidthMinutes * 100) + '%';

                          return (
                            <Box key={epg.id} style={{ ...styles.program, width: programWidth }}>
                              <Box style={{ ...styles.programInner }} bg='$warmGray400'>
                                <Text style={{ ...styles.programTitle }}>{atob(epg.title)}</Text>
                              </Box>
                            </Box>
                          );
                        })
                      }
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      }
    </>
  )
}

const channelCardWidth = 300;

const styles = StyleSheet.create({
  channel: {
    display: 'flex',
    height: 120,
    marginBottom: 8
  },
  channelInner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    height: '100%',
    width: '100%'
  },
  channelNameCard: {
    display: 'flex',
    alignItems: 'center',
    width: channelCardWidth,
    marginRight: 4,
    borderRadius: 6,
    padding: 20
  },
  channelIcon: {
    maxWidth: 90
  },
  channelTitle: {
    display: 'inline',
    marginLeft: 16,
    fontWeight: 700,
    fontSize: 18,
    lineHeight: 1.2
  },
  programList: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
  },
  program: {
    display: 'flex',
    paddingVertical: 0,
    paddingHorizontal: 4
  },
  programInner: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 6,
    cursor: 'pointer',
    padding: 25,
  },
  programTitle: {
    fontWeight: 700
  }
});

export default TVGuide;