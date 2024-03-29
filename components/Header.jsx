import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import { Avatar, AvatarFallbackText, Box, HStack, Icon, LinkText, Menu, MenuItem, MenuItemLabel, Pressable, SettingsIcon } from '@gluestack-ui/themed';
import { CircleUserRound, LogOut, Search } from 'lucide-react-native';
import { supabase } from '../config/supabase'

import Logo from '../assets/images/svg/logo';

function Header({ session }) {
  console.log(session);
  useEffect(() => {
    // do something
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Box grid='container-fluid' sx={{ position: 'sticky', zIndex: 10, top: 0, background: 'rgba(0, 0, 0, 0.5)', marginTop: 10 }}>
        <Box grid='row'>
          <Box grid='col' columns='12'>
            <Box grid="container">
              <Box grid='row'>
                <Box grid='col' columns='12' sx={navStyles}>
                  <HStack reversed={false} sx={MainNavSX}>
                    <Link href="/" style={LinkSX}>
                      <Logo width={75} height={94} />
                    </Link>
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
                  </HStack>
                  <HStack reversed={false} sx={SecondaryNavSX}>
                    <Link href="/search" style={LinkSX}>
                      <Icon as={Search} size="xl" color="$white" />
                    </Link>
                    {(session) ?
                      <>
                        <Menu
                          placement="bottom"
                          trigger={({ ...triggerProps }) => {
                            return (
                              <Pressable {...triggerProps}>
                                <Avatar bgColor="$green600" size="md" borderRadius="$full">
                                  <AvatarFallbackText>{`${session.user.user_metadata.firstName} ${session.user.user_metadata.lastName}`}</AvatarFallbackText>
                                </Avatar>
                              </Pressable>
                            )
                          }}
                        >
                          <MenuItem key="Settings" textValue="Settings" onPress={() => {window.location.href = '/account'}}>
                            <Icon as={SettingsIcon} size="sm" mr="$2" />
                            <MenuItemLabel size="sm">Settings</MenuItemLabel>
                          </MenuItem>
                          <MenuItem key="SignOut" textValue="Settings" onPress={() => supabase.auth.signOut()}>
                            <Icon as={LogOut} size="sm" mr="$2" />
                            <MenuItemLabel size="sm">Sign Out</MenuItemLabel>
                          </MenuItem>
                        </Menu>
                      </>
                      :
                      <Link href="/series" style={LinkSX}>
                        <Icon as={CircleUserRound} size="xl" mr="$2" color="$white"/>
                        <LinkText sx={LinkTextSX}>Sign In</LinkText>
                      </Link>
                    }
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