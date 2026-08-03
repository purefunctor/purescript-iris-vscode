module Main where

import Lib (renamedShared)

identity value = value

answer = identity renamedShared
-- @marker identity-use 9
-- @marker shared-use 18

completion =
-- @marker completion 12
