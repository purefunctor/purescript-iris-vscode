module Main where

import Lib (shared)

identity value = value

answer = identity shared
-- @marker identity-use 9
-- @marker shared-use 18

completion =
-- @marker completion 12
