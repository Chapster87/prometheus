import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import { Box, Button, ButtonText, HStack, LinkText } from '@gluestack-ui/themed';
import { supabase } from '../config/supabase'

function Header({ session }) {
  useEffect(() => {
    // do something
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Box grid='container-fluid' sx={{ position: 'sticky', zIndex: 10, top: 0, background: 'rgba(0, 0, 0, 0.5)' }}>
        <Box grid='row'>
          <Box grid='col' columns='12'>
            <Box grid="container">
              <Box grid='row'>
                <Box grid='col' columns='12' sx={navStyles}>
                  <HStack reversed={false} sx={MainNavSX}>
                    <Link href="/" style={LinkSX}>
                      <LinkText sx={LinkTextSX}>Home</LinkText>
                    </Link>
                    <Link href="/tv" style={LinkSX}>
                      <LinkText sx={LinkTextSX}>Live TV</LinkText>
                    </Link>
                    <Link href="/movies" style={LinkSX}>
                      <LinkText sx={LinkTextSX}>Movies</LinkText>
                    </Link>
                    <Link href="/series" style={LinkSX}>
                      <LinkText sx={LinkTextSX}>Series</LinkText>
                    </Link>
                    <Link href="/account" style={LinkSX}>
                      <LinkText sx={LinkTextSX}>Account</LinkText>
                    </Link>
                  </HStack>
                  <HStack reversed={false} sx={SecondaryNavSX}>
                    {(!!session) &&
                    <Button variant="gradient" onPress={() => supabase.auth.signOut()}>
                      <ButtonText>Sign Out</ButtonText>
                    </Button>}
                  </HStack>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

const navStyles = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between'
}

const MainNavSX = {
  display: 'flex',
  height: 80,
  gap: 75
}

const LinkSX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const LinkTextSX = {
  color: '$white',
  fontSize: 24,
  fontWeight: '700',
  textDecoration: 'none',
  borderBottomWidth: 3,
  borderColor: 'transparent',
  textTransform: 'uppercase',
  ":hover": {
    borderBottomWidth: 3,
    borderColor:'$borderLight200',
  }
}

const SecondaryNavSX = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  height: 80,
  gap: 75
}

export default Header;