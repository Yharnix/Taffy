
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
            pkgs.awscli2
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
    # have to set npm config path

    npm config set prefix '~/.mutable_npm'
    mkdir $HOME/.mutable_npm
    export PATH=$HOME/.mutable_npm/bin:$PATH
    npm install -g smee-client
    npm install -g aws-cdk
    '';
        };

        # Devshell 2 with Pandas and Islp
      };
    };
  };
}
