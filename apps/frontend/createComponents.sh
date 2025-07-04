#!/bin/bash
# Create a new component
# 引数のチェック
if [ $# -ne 1 ]; then
    echo "Usage: $0 [ComponentName]"
    exit 1
fi


# 最初の引数はコンポーネント名として使う。例えば、"Infomation"とすると、Infomation.tsxというファイルが作成される。
NAME=$1
# CamelCaseからsnake_caseに変換する

# ファイルを作成する
echo "

interface ${NAME}Props extends React.PropsWithChildren {
    className?: string;
}
    
const ${NAME} = (props: ${NAME}Props) => {
    console.log(\"${NAME} props:\", props);
    return (
        <div >
        <h1>${NAME}</h1>
        </div>
    );
    
}

export default ${NAME};
" > src/components/${NAME}.tsx
