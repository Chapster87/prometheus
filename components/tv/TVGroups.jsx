import { useState, useEffect } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Box, View } from '@gluestack-ui/themed';
import Card from 'react-bootstrap/Card';

function TVGroups({page, spark}) {
  const [mediaCategory, setMediaCategory] = useState([]);
  
  useEffect(() => {
    // spark.getLiveStreamCategory()
    //   .then(console.log)
    //   .catch(console.log)

    spark.getLiveStreamCategory()
      .then((data) => setMediaCategory(data));
  }, []);

  return (
    <>
      {(mediaCategory) &&
        <Box grid='container-fluid'>
          <Box grid='row'>
            <Box grid='col' columns='12'>
              <h1>{page}</h1>
              <View style={styles.tileGrid}>
                {mediaCategory.map(cat =>
                  <Link 
                    href={{
                      pathname: '/tv/category/[id]',
                      params: { id: cat.category_id, name: cat.category_name }
                    }}
                    asChild
                    key={cat.category_id}
                  >
                    <Pressable>
                      <Card style={{ width: '18rem', margin: '1rem', cursor: 'pointer' }} key={cat.category_id}>
                        <Card.Body>
                          <Card.Title>{cat.category_name}</Card.Title>
                        </Card.Body>
                      </Card>
                    </Pressable>
                  </Link>
                )}
              </View>
            </Box>
          </Box>
        </Box>
      }
    </>
  )
}

const styles = StyleSheet.create({
  tileGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  }
});

export default TVGroups;