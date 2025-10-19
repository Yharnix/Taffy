# SPDX-License-Identifier: Unlicense
# {
#   inputs = {
#     nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

#     # Support a particular subset of the Nix systems
#     # systems.url = "github:nix-systems/default";
#   };

#   outputs =
#     { nixpkgs, ... }:
#     let
#       eachSystem =
#         f:
#         nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed (system: f nixpkgs.legacyPackages.${system});
#     in
#     {
#       devShells = eachSystem (pkgs: {
#         default = pkgs.mkShell {
#           packages = [
#             pkgs.nodejs
#             # pkgs.awscli2
#             pkgs.python313
#             pkgs.python313Packages.boto3
#             pkgs.python313Packages.requests

#             # Alternatively, you can use a specific major version of Node.js

#             # pkgs.nodejs-22_x

#             # Use corepack to install npm/pnpm/yarn as specified in package.json
#             pkgs.corepack
#             pkgs.jq

#             # To install a specific alternative package manager directly,
#             # comment out one of these to use an alternative package manager.

#             # pkgs.yarn
#             # pkgs.pnpm
#             # pkgs.bun

#             # Required to enable the language server
#             # pkgs.nodePackages.typescript
#             # pkgs.nodePackages.typescript-language-server
#             # pkgs.nodePackages.aws-cdk

#             # Python is required on NixOS if the dependencies require node-gyp

#             # pkgs.python3
#           ];
#           shellHook = ''
# # have to set npm config path

# npm config set prefix '~/.mutable_npm'
# mkdir $HOME/.mutable_npm
# export PATH=$HOME/.mutable_npm/bin:$PATH
# npm install -g aws-cdk
# '';
#         };
#       });
#     };
# }

  
{
  description = "A simple Python project with NumPy and other packages";

  inputs = {
    # nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.05";
    nixgl.url = "github:guibou/nixGL";
    nixgl.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nixpkgs, nixgl }: {
    devShells = {
      x86_64-linux = let
        pkgs = nixpkgs.legacyPackages.x86_64-linux;
        pythonEnv = pkgs.python313.withPackages (ps: [
          ps.fastapi
          ps.requests
          ps.pyjwt          # PyJWT
          ps.cryptography   # enables RS256 support in PyJWT
          ps.python-dotenv
          ps.fastapi-cli
          ps.boto3
        ]);
      in {
        # Devshell 1 with NumPy and Matplotlib
        default = pkgs.mkShell {
          buildInputs = [
            pkgs.python313
            pkgs.nodejs
            pkgs.jq
            # pkgs.nodePackages.pyright
            # pkgs.texlive.combined.scheme-full
            pythonEnv
            # pkgs.python313Packages.fastapi
            # pkgs.python313Packages.requests
            # pkgs.python313Packages.pyjwt
            # pkgs.python313Packages.cryptography
            # pkgs.python313Packages.python-dotenv
            # pkgs.python313Packages.fastapi-cli
            # pkgs.python313Packages.boto3
          ];
          shellHook = ''
            export PYTHONSTARTUP=.homework1/startup.py
          '';
        };

        # Devshell 2 with Pandas and Islp
      };
    };
  };
}
