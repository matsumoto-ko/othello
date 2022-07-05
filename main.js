//import "./scss/style.scss";
//containerの調整
const container = document.getElementById("container");
container.style.width = window.innerWidth * 0.8 + "px";

//resultの設定
const result = document.getElementById("result");

//白黒のターン表示
const playerDisplay = document.getElementById("player-color");
playerDisplay.textContent = "白のターン";
//勝者表示
const winner = document.getElementById("winner");
//パスの時
const passBotton = document.getElementById("pass");

//ボードの土台の作成
const foundation = document.getElementById("canvas");
//マス目のサイズ(ここで全てのサイズを決めるので重要な値)
const gap = 3;
const dividedBoardWidth = window.innerWidth * 0.09;
//ディスクのサイズ
const diskWidth = dividedBoardWidth * 0.9;
const borderRadius = diskWidth;
const diskGap = dividedBoardWidth * 0.05;

//マス目サイズに応じたボードサイズの決定
foundation.style.width = dividedBoardWidth * 8 + gap * 9 + "px";
foundation.style.height = dividedBoardWidth * 8 + gap * 9 + "px";

//マス目、ディスクの作成
class Board {
  constructor(parent) {
    this.parent = parent;
    this.turn = 1;
    let self = this;
    //パスボタンの設定
    passBotton.addEventListener("click", function () {
      self.passTurn(self.turn);
    });
    //置けるマスを入れとくやつ
    this.placeableBoard = [];

    //マス目の情報をいれとくやつ
    this.dividedBoardInformation = new Array(64);

    //マス目、ディスクの作成

    for (let i = 0; i < 64; i++) {
      let column = Math.floor(i / 8);
      let raw = i % 8;
      //console.log(column, raw);

      //マス目の設計
      let dividedBoard = document.createElement("div");
      dividedBoard.className = "DB";
      dividedBoard.style.width = dividedBoardWidth + "px";
      dividedBoard.style.height = dividedBoardWidth + "px";
      dividedBoard.style.top = (dividedBoardWidth + gap) * column + gap + "px";
      dividedBoard.style.left = gap + (dividedBoardWidth + gap) * raw + "px";

      //ディスクの設計
      let disk = document.createElement("div");
      disk.className = "Disk";
      disk.style.width = diskWidth + "px";
      disk.style.height = diskWidth + "px";
      disk.style.borderRadius = borderRadius + "px";
      disk.style.top = diskGap + "px";
      disk.style.left = diskGap + "px";
      //各マスにindex情報を置く
      disk.setAttribute("index", i);
      //代入しておかないとだめみたい(実質は配列になってるみたいで、setDiskの時にdividedBoardとdiskを関連付けるためにやる)
      dividedBoard.Disk = disk;

      //ディスクをマス目に格納
      dividedBoard.appendChild(disk);
      //同時にdiskInformationにも並べる
      this.dividedBoardInformation[i] = dividedBoard;
      //真ん中に石を初期配置
      if (i == 27 || i == 36) {
        this.dividedBoardInformation[i].Disk.style.display = "block";
        this.dividedBoardInformation[i].Disk.style.backgroundColor = "white";
      }
      if (i == 28 || i == 35) {
        this.dividedBoardInformation[i].Disk.style.display = "block";
        this.dividedBoardInformation[i].Disk.style.backgroundColor = "black";
      }
      //console.log(this.dividedBoardInformation[i].Disk.style.display);
      //6/25各マス目にクリックされたときの動き書いとく
      //他スコープでオブジェクト本体を指定できるように、ここでthis（オブジェクト本体を示す）をselfに入れとく

      dividedBoard.addEventListener("click", function () {
        self.setDisk(i, self.turn);
      });

      //マス目をボードに並べる
      this.parent.appendChild(dividedBoard);
      //同時にdiskInformationにも並べる
      //this.dividedBoardInformation[column][raw] = dividedBoard;
      //console.log(this.dividedBoardInformation);
    }
    this.placeableBoard = this.displayPlaceableBoard(this.turn);
  }
  passTurn(turn) {
    if (turn == 1) {
      this.turn = 2;
    } else {
      this.turn = 1;
    }
    playerDisplay.textContent = this.turn == 1 ? "白のターン" : "黒のターン";
    this.placeableBoard.forEach((element) => {
      element.style.opacity = 1;
    });
    this.placeableBoard = this.displayPlaceableBoard(this.turn);
    console.log(this.turn);
  }
  setDisk = function (i, turn) {
    const reversibleDisk = this.IsThereReversibleDisk(i, turn);
    if (this.dividedBoardInformation[i].Disk.style.display == "block") {
      //すでに石が置いてあるとき
      alert("ここには置けません");
    } else if (reversibleDisk.length == 0) {
      //返せる石がないとき
      alert("返せる石がありません");
    } else {
      //置くことができるとき
      //PlaceableBoardをリセットして、置ける所を表示したマスをリセット
      this.placeableBoard.forEach((element) => {
        element.style.opacity = 1;
      });

      //まずは自分の石を置く
      this.dividedBoardInformation[i].Disk.style.display = "block";
      this.dividedBoardInformation[i].Disk.style.backgroundColor =
        turn == 1 ? "white" : "black";

      //ひっくり返す
      reversibleDisk.forEach((element) => {
        element.Disk.style.backgroundColor = turn == 1 ? "white" : "black";
      });
      //相手のターンへの準備
      if (this.turn == 1) {
        this.turn = 2;
      } else {
        this.turn = 1;
      }
      playerDisplay.textContent = turn == 1 ? "黒のターン" : "白のターン";

      //次に置けるマスの表示
      this.placeableBoard = this.displayPlaceableBoard(this.turn);

      //すべてのマスが埋まったら勝敗を判定
      if (
        this.dividedBoardInformation.every(
          (element) => element.Disk.style.display == "block"
        )
      ) {
        console.log("gameset");
        let blackDiskNum = this.dividedBoardInformation.filter((element) => {
          return element.Disk.style.backgroundColor == "black";
        }).length;
        let whiteDiskNum = 64 - blackDiskNum;
        if (blackDiskNum > whiteDiskNum) {
          winner.textContent = "黒の勝ちです";
        } else if (whiteDiskNum > blackDiskNum) {
          winner.textContent = "白の勝ちです";
        } else {
          winner.textContent = "引きわけです";
        }
        result.style.display = "block";
      }
    }
  };
  IsThereReversibleDisk = function (index, turn) {
    let playerColor = turn == 1 ? "white" : "black";
    let self = this;
    //裏返す石を探して、resultにいれる関数
    let reversibleDividedBoard = [];
    let searcheDirections = [1, 9, 8, 7, -1, -9, -8, -7];
    let remainingDividedboards = [
      7 - (index % 8),
      Math.min(7 - (index % 8), (56 + (index % 8) - index) / 8),
      (56 + (index % 8) - index) / 8,
      Math.min(index % 8, (56 + (index % 8) - index) / 8),
      index % 8,
      Math.min(index % 8, (index - (index % 8)) / 8),
      (index - (index % 8)) / 8,
      Math.min(7 - (index % 8), (index - (index % 8)) / 8),
      //7 - (index % 8), //クリックされた石から右に何マスあるか
      //Math.min(7 - (index % 8), (56 + (index % 8) - index) / 8), //右下
      //(56 + (index % 8) - index) / 8, //下
      //Math.min(index % 8, (56 + (index % 8) - index) / 8), //左下
      //index % 8, //左
      //Math.min(((index % 8) - index) / 8, index % 8), //左上
      //((index % 8) - index) / 8, //上
      //Math.min(((index % 8) - index) / 8, 7 - (index % 8)), //右上
    ];
    console.log(playerColor);
    for (let i = 0; i < 8; i++) {
      let tentativeReversibleDividedBoard = [];
      let searcheDirection = searcheDirections[i];
      console.log(searcheDirection);
      //探す方向のマス目が0だったらスキップする。
      let remainingDividedboardNum = remainingDividedboards[i];
      if (remainingDividedboardNum == 0) continue;

      //隣にマスがあればそれを取得する
      console.log("となりにマスがあります");
      let nextDividedBoard =
        self.dividedBoardInformation[index + searcheDirection];

      //if (remainingDividedboardNum == 0) continue; //1
      //console.log("phase1");
      //console.log(nextDividedBoard.Disk.style.display !== "block");

      if (
        nextDividedBoard.Disk.style.display !== "block" || //石がなかったらcontinue
        nextDividedBoard.Disk.style.backgroundColor == playerColor //石があっても自分の色だったらcontinue
      )
        continue;
      console.log("となりに石があって、相手の色である");
      tentativeReversibleDividedBoard.push(nextDividedBoard); //この石はひっくり返せるかもしれないので仮に入れとく
      console.log(tentativeReversibleDividedBoard);
      for (let j = 0; j < remainingDividedboardNum - 1; j++) {
        //延長線上を調べる
        let extentionDividedBoard =
          self.dividedBoardInformation[
            index + searcheDirection * 2 + searcheDirection * j
          ];
        if (extentionDividedBoard.Disk.style.display !== "block") break;
        console.log("延長線上に石がある〇");
        if (extentionDividedBoard.Disk.style.backgroundColor == playerColor) {
          reversibleDividedBoard = reversibleDividedBoard.concat(
            tentativeReversibleDividedBoard
          );
          console.log("自分の色をみつけたので、この間はひっくり返せる");
          console.log(reversibleDividedBoard);
          break;
        } else {
          tentativeReversibleDividedBoard.push(extentionDividedBoard);
          console.log("その色が相手の色なので、さらにひとつ先を見る");
        }
      }
    }
    console.log(reversibleDividedBoard);
    console.log("phase6");
    return reversibleDividedBoard;
  };
  displayPlaceableBoard(turn) {
    let displayedPlaceableBoard = [];
    for (let i = 0; i < 64; i++) {
      let reversibleDiskNum = this.IsThereReversibleDisk(i, turn).length;
      if (reversibleDiskNum > 0) {
        //すでに石が置いてあるところも調べてしまうので、そこは処理をスルーする
        if (this.dividedBoardInformation[i].Disk.style.display == "block")
          continue;
        //this.dividedBoardInformation[i].Disk.style.display = "block";
        //this.dividedBoardInformation[i].Disk.style.backgroundColor = "white";
        this.dividedBoardInformation[i].style.opacity = 0.5;
        displayedPlaceableBoard.push(this.dividedBoardInformation[i]);
      }
    }
    return displayedPlaceableBoard;
  }
}
//オセロボードの作成
const othello = new Board(foundation);
