module Lib where

shared :: Int
-- @marker shared-declaration 0
shared = 42

alias = shared
-- @marker shared-reference 8
