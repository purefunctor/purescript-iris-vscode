module Lib where

renamedShared :: Int
-- @marker shared-declaration 0
renamedShared = 42

alias = renamedShared
-- @marker shared-reference 8
