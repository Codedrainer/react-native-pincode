import * as React from "react";
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableHighlight,TouchableOpacity,
  Vibration,
  View,
  ViewStyle
} from "react-native";
import { Col, Row, Grid } from "react-native-easy-grid";
import { grid } from "./design/grid";
import { colors } from "./design/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as _ from "lodash";
import * as Animatable from 'react-native-animatable';
import Animate from "react-move/Animate";
import { easeLinear } from "d3-ease";
import delay from "./delay";

/**
 * Pin Code Component
 */

export type IProps = {
  endProcess: (pinCode: string) => void
  sentenceTitle: string
  subtitle: string
  status: PinStatus
  buttonDeleteText?: string
  cancelFunction?: () => void
  previousPin?: string
  pinCodeStatus?: "initial" | "success" | "failure" | "locked"
  buttonNumberComponent?: any
  passwordLength: number
  iconButtonDeleteDisabled?: boolean
  passwordComponent?: any
  titleAttemptFailed: string
  titleConfirmFailed: string
  subtitleError: string
  colorPassword?: string
  colorPasswordError?: string
  numbersButtonOverlayColor?: string
  buttonDeleteComponent?: any
  titleComponent?: any
  subtitleComponent?: any
  styleButtonCircle?: StyleProp<ViewStyle>
  styleTextButton?: StyleProp<TextStyle>
  styleCircleHiddenPassword?: StyleProp<ViewStyle>
  styleCircleSizeEmpty?: number
  styleCircleSizeFull?: number
  styleRowButtons?: StyleProp<ViewStyle>
  styleColumnButtons?: StyleProp<ViewStyle>
  styleEmptyColumn?: StyleProp<ViewStyle>
  styleViewTitle?: StyleProp<ViewStyle>
  styleTextTitle?: StyleProp<TextStyle>
  styleTextSubtitle?: StyleProp<TextStyle>
  styleContainer?: StyleProp<ViewStyle>
  styleColumnDeleteButton?: StyleProp<ViewStyle>
  styleDeleteButtonColorShowUnderlay?: string
  styleDeleteButtonColorHideUnderlay?: string
  styleDeleteButtonIcon?: string
  styleDeleteButtonSize?: number
  styleDeleteButtonText?: StyleProp<TextStyle>
  styleColorTitle?: string
  styleColorTitleError?: string
  styleColorSubtitle?: string
  styleColorSubtitleError?: string
  styleColorButtonTitle?: string
  styleColorButtonTitleSelected?: string
}

export type IState = {
  password: string
  moveData: { x: number; y: number }
  showError: boolean
  textButtonSelected: string
  colorDelete: string
  attemptFailed: boolean
  changeScreen: boolean
}

export enum PinStatus {
  choose = "choose",
  confirm = "confirm",
  enter = "enter"
}

const textDeleteButtonDefault = "delete";

class PinCode extends React.PureComponent<IProps, IState> {
  _circleSizeEmpty: number;
  _circleSizeFull: number;

  constructor(props: IProps) {
    super(props);
    this.state = {
      password: "",
      moveData: { x: 0, y: 0 },
      showError: false,
      textButtonSelected: "",
      colorDelete: this.props.styleDeleteButtonColorHideUnderlay
        ? this.props.styleDeleteButtonColorHideUnderlay
        : "rgb(211, 213, 218)",
      attemptFailed: false,
      changeScreen: false
    };
    this._circleSizeEmpty = this.props.styleCircleSizeEmpty || 4;
    this._circleSizeFull = this.props.styleCircleSizeFull || 8;
    this.renderButtonNumber = this.renderButtonNumber.bind(this);
    this.renderCirclePassword = this.renderCirclePassword.bind(this);
    this.doShake = this.doShake.bind(this);
    this.showError = this.showError.bind(this);
    this.endProcess = this.endProcess.bind(this);
    this.failedAttempt = this.failedAttempt.bind(this);
    this.newAttempt = this.newAttempt.bind(this);
    this.renderButtonDelete = this.renderButtonDelete.bind(this);
    this.onPressButtonNumber = this.onPressButtonNumber.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
  }

  componentWillUpdate(nextProps: IProps) {
    if (
      this.props.pinCodeStatus !== "failure" &&
      nextProps.pinCodeStatus === "failure"
    ) {
      this.failedAttempt();
    }
  }

  failedAttempt = async () => {
    this.setState({ changeScreen: true });
    await delay(300);
    this.setState({
      showError: true,
      attemptFailed: true,
      changeScreen: false,
      password: ""
    });
    this.doShake();
  };

  newAttempt = async () => {
    this.setState({ changeScreen: true });
    await delay(200);
    this.setState({
      changeScreen: false,
      showError: false,
      attemptFailed: false
    });
  };

  onPressButtonNumber = async (text: string) => {
    if (this.state.showError && this.state.attemptFailed) this.newAttempt();
    const currentPassword = this.state.password + text;
    this.setState({ password: currentPassword });
    if (currentPassword.length === this.props.passwordLength) {
      switch (this.props.status) {
        case PinStatus.choose:
          this.endProcess(currentPassword);
          break;
        case PinStatus.confirm:
          if (currentPassword !== this.props.previousPin) {
            this.showError();
          } else {
            this.endProcess(currentPassword);
          }
          break;
        case PinStatus.enter:
          this.props.endProcess(currentPassword);
          await delay(300);
          break;
        default:
          break;
      }
    }
  };

  renderButtonNumber = (text: string) => {
    const disabled =
      (this.state.password.length === this.props.passwordLength ||
        this.state.showError) &&
      !this.state.attemptFailed;
    return (
      <Animate
        show={true}
        start={{
          opacity: 1
        }}
        update={{
          opacity: [
            this.state.showError && !this.state.attemptFailed ? 0.5 : 1
          ],
          timing: { duration: 200, ease: easeLinear }
        }}>
        {({ opacity }: any) => (
          <TouchableOpacity
            style={
              this.props.styleButtonCircle
                ? this.props.styleButtonCircle
                : styles.buttonCircle
            }
            underlayColor={
              this.props.numbersButtonOverlayColor
                ? this.props.numbersButtonOverlayColor
                : colors.turquoise
            }
            disabled={disabled}
            onShowUnderlay={() => this.setState({ textButtonSelected: text })}
            onHideUnderlay={() => this.setState({ textButtonSelected: "" })}
            onPress={() => {
              this.onPressButtonNumber(text);
            }}>
            <Text
              style={[
                this.props.styleTextButton
                  ? this.props.styleTextButton
                  : styles.text,
                {
                  opacity: opacity,
                  color:
                    this.state.textButtonSelected === text
                      ? this.props.styleColorButtonTitleSelected
                      ? this.props.styleColorButtonTitleSelected
                      : colors.white
                      : this.props.styleColorButtonTitle
                      ? this.props.styleColorButtonTitle
                      : colors.grey
                }
              ]}>
              {text}
            </Text>
          </TouchableOpacity>
        )}
      </Animate>
    );
  };

  endProcess = (pwd: string) => {
    setTimeout(() => {
      this.setState({ changeScreen: true });
      setTimeout(() => {
        this.props.endProcess(pwd);
      }, 500);
    }, 400);
  };

  async doShake() {
    const duration = 70;
    Vibration.vibrate(500, false);
    const length = Dimensions.get("window").width / 3;
    await delay(duration);
    this.setState({ moveData: { x: length, y: 0 } });
    await delay(duration);
    this.setState({ moveData: { x: -length, y: 0 } });
    await delay(duration);
    this.setState({ moveData: { x: length / 2, y: 0 } });
    await delay(duration);
    this.setState({ moveData: { x: -length / 2, y: 0 } });
    await delay(duration);
    this.setState({ moveData: { x: length / 4, y: 0 } });
    await delay(duration);
    this.setState({ moveData: { x: -length / 4, y: 0 } });
    await delay(duration);
    this.setState({ moveData: { x: 0, y: 0 }, password: "" });
  }

  async showError() {
    this.setState({ changeScreen: true });
    await delay(300);
    this.setState({ showError: true, changeScreen: false });
    this.doShake();
    await delay(3000);
    this.setState({ changeScreen: true });
    await delay(200);
    this.setState({ showError: false });
    await delay(200);
    this.props.endProcess(this.state.password);
  }

  renderCirclePassword = () => {
    const {
      password,
      moveData,
      showError,
      changeScreen,
      attemptFailed
    } = this.state;
    return (
      <View
        style={
          this.props.styleCircleHiddenPassword
            ? this.props.styleCircleHiddenPassword
            : styles.viewCirclePassword
        }>
        {_.range(this.props.passwordLength).map((val: number) => {
          const lengthSup =
            ((password.length >= val + 1 && !changeScreen) || showError) &&
            !attemptFailed;
          const marginSup =
            ((password.length > 0 && !changeScreen) || showError) &&
            !attemptFailed;
          return (
            <Animatable.View
              key={val}
              animation={showError ? 'shake' : ''}
              useNativeDriver={true}
              direction={'alternate'}
            >
              <View
                style={{
                  opacity:lengthSup ? 1 : 0.5,
                  height:lengthSup ? this._circleSizeFull : this._circleSizeEmpty,
                  width: lengthSup ? this._circleSizeFull : this._circleSizeEmpty,
                  borderRadius:lengthSup
                    ? this._circleSizeFull / 2
                    : this._circleSizeEmpty / 2,
                  marginLeft: lengthSup ? 10 - (this._circleSizeFull - this._circleSizeEmpty) / 2 : 10,
                  marginRight: lengthSup ? 10 - (this._circleSizeFull - this._circleSizeEmpty) / 2 : 10,
                  marginBottom: marginSup ? 32 - (this._circleSizeFull - this._circleSizeEmpty) / 2 : 32,
                  marginTop: marginSup ? 64 - (this._circleSizeFull - this._circleSizeEmpty) / 2 : 64,
                  backgroundColor: showError
                    ? this.props.colorPasswordError
                      ? this.props.colorPasswordError
                      : colors.alert
                    : this.props.colorPassword
                      ? this.props.colorPassword
                      : colors.turquoise
                }}
              />
            </Animatable.View>
            /* )}
           </Animate>*/
          );
        })}
      </View>
    );
  };

  renderButtonDelete = (opacity: number) => {
    return (
      <TouchableHighlight
        disabled={this.state.password.length === 0}
        underlayColor="transparent"
        onHideUnderlay={() =>
          this.setState({
            colorDelete: this.props.styleDeleteButtonColorHideUnderlay
              ? this.props.styleDeleteButtonColorHideUnderlay
              : "rgb(211, 213, 218)"
          })
        }
        onShowUnderlay={() =>
          this.setState({
            colorDelete: this.props.styleDeleteButtonColorShowUnderlay
              ? this.props.styleDeleteButtonColorShowUnderlay
              : colors.turquoise
          })
        }
        onPress={() =>
          this.state.password.length > 0 &&
          this.setState({ password: this.state.password.slice(0, -1) })
        }>
        <View
          style={
            this.props.styleColumnDeleteButton
              ? this.props.styleColumnDeleteButton
              : styles.colIcon
          }
        >
          {!this.props.iconButtonDeleteDisabled && (
            <Icon
              name={
                this.props.styleDeleteButtonIcon
                  ? this.props.styleDeleteButtonIcon
                  : "backspace"
              }
              size={
                this.props.styleDeleteButtonSize
                  ? this.props.styleDeleteButtonSize
                  : 30
              }
              color={this.state.colorDelete}
              style={{ opacity: opacity }}
            />
          )}
          <Text
            style={[
              this.props.styleDeleteButtonText
                ? this.props.styleDeleteButtonText
                : styles.textDeleteButton,
              { color: this.state.colorDelete, opacity: opacity }
            ]}>
            {this.props.buttonDeleteText
              ? this.props.buttonDeleteText
              : textDeleteButtonDefault}
          </Text>
        </View>
      </TouchableHighlight>
    );
  };

  renderTitle = (
    colorTitle: string,
    opacityTitle: number,
    attemptFailed: boolean,
    showError: boolean
  ) => {
    return (
      <Text
        style={[
          this.props.styleTextTitle
            ? this.props.styleTextTitle
            : styles.textTitle,
          { color: colorTitle, opacity: opacityTitle }
        ]}>
        {(attemptFailed && this.props.titleAttemptFailed) ||
        (showError && this.props.titleConfirmFailed) ||
        this.props.sentenceTitle}
      </Text>
    );
  };

  renderSubtitle = (
    colorTitle: string,
    opacityTitle: number,
    attemptFailed: boolean,
    showError: boolean
  ) => {
    return (
      <Text
        style={[
          this.props.styleTextSubtitle
            ? this.props.styleTextSubtitle
            : styles.textSubtitle,
          { color: colorTitle, opacity: opacityTitle }
        ]}>
        {attemptFailed || showError
          ? this.props.subtitleError
          : this.props.subtitle}
      </Text>
    );
  };

  render() {
    const { password, showError, attemptFailed, changeScreen } = this.state;
    return (
      <View
        style={
          this.props.styleContainer
            ? this.props.styleContainer
            : styles.container
        }>
        <Animate
          show={true}
          start={{
            opacity: 0,
            colorTitle: this.props.styleColorTitle
              ? this.props.styleColorTitle
              : colors.grey,
            colorSubtitle: this.props.styleColorSubtitle
              ? this.props.styleColorSubtitle
              : colors.grey,
            opacityTitle: 1
          }}
          enter={{
            opacity: [1],
            colorTitle: [
              this.props.styleColorTitle
                ? this.props.styleColorTitle
                : colors.grey
            ],
            colorSubtitle: [
              this.props.styleColorSubtitle
                ? this.props.styleColorSubtitle
                : colors.grey
            ],
            opacityTitle: [1],
            timing: { duration: 200, ease: easeLinear }
          }}
          update={{
            opacity: [changeScreen ? 0 : 1],
            colorTitle: [
              showError || attemptFailed
                ? this.props.styleColorTitleError
                ? this.props.styleColorTitleError
                : colors.alert
                : this.props.styleColorTitle
                ? this.props.styleColorTitle
                : colors.grey
            ],
            colorSubtitle: [
              showError || attemptFailed
                ? this.props.styleColorSubtitleError
                ? this.props.styleColorSubtitleError
                : colors.alert
                : this.props.styleColorSubtitle
                ? this.props.styleColorSubtitle
                : colors.grey
            ],
            opacityTitle: [showError || attemptFailed ? grid.highOpacity : 1],
            timing: { duration: 200, ease: easeLinear }
          }}>
          {({ opacity, colorTitle, colorSubtitle, opacityTitle }: any) => (
            <View
              style={[
                this.props.styleViewTitle
                  ? this.props.styleViewTitle
                  : styles.viewTitle,
                { opacity: opacity }
              ]}>
              {this.props.titleComponent
                ? this.props.titleComponent()
                : this.renderTitle(
                  colorTitle,
                  opacityTitle,
                  attemptFailed,
                  showError
                )}
              {this.props.subtitleComponent
                ? this.props.subtitleComponent()
                : this.renderSubtitle(
                  colorSubtitle,
                  opacityTitle,
                  attemptFailed,
                  showError
                )}
            </View>
          )}
        </Animate>
        <View>
          {this.props.passwordComponent
            ? this.props.passwordComponent()
            : this.renderCirclePassword()}
        </View>
        <Grid
          style={{ maxHeight: grid.unit * 22, maxWidth: grid.unit * 16.25 }}>
          <Row
            style={
              this.props.styleRowButtons
                ? this.props.styleRowButtons
                : styles.row
            }>
            {_.range(1, 4).map((i: number) => {
              return (
                <Col
                  key={i}
                  style={
                    this.props.styleColumnButtons
                      ? this.props.styleColumnButtons
                      : styles.colButtonCircle
                  }>
                  {this.props.buttonNumberComponent
                    ? this.props.buttonNumberComponent(
                      i,
                      this.onPressButtonNumber
                    )
                    : this.renderButtonNumber(i.toString())}
                </Col>
              );
            })}
          </Row>
          <Row
            style={
              this.props.styleRowButtons
                ? this.props.styleRowButtons
                : styles.row
            }>
            {_.range(4, 7).map((i: number) => {
              return (
                <Col
                  key={i}
                  style={
                    this.props.styleColumnButtons
                      ? this.props.styleColumnButtons
                      : styles.colButtonCircle
                  }>
                  {this.props.buttonNumberComponent
                    ? this.props.buttonNumberComponent(
                      i,
                      this.onPressButtonNumber
                    )
                    : this.renderButtonNumber(i.toString())}
                </Col>
              );
            })}
          </Row>
          <Row
            style={
              this.props.styleRowButtons
                ? this.props.styleRowButtons
                : styles.row
            }>
            {_.range(7, 10).map((i: number) => {
              return (
                <Col
                  key={i}
                  style={
                    this.props.styleColumnButtons
                      ? this.props.styleColumnButtons
                      : styles.colButtonCircle
                  }>
                  {this.props.buttonNumberComponent
                    ? this.props.buttonNumberComponent(
                      i,
                      this.onPressButtonNumber
                    )
                    : this.renderButtonNumber(i.toString())}
                </Col>
              );
            })}
          </Row>
          <Row
            style={
              this.props.styleRowButtons
                ? this.props.styleRowButtons
                : styles.row
            }>
            <Col
              style={
                this.props.styleEmptyColumn
                  ? this.props.styleEmptyColumn
                  : styles.colEmpty
              }
            />
            <Col
              style={
                this.props.styleColumnButtons
                  ? this.props.styleColumnButtons
                  : styles.colButtonCircle
              }>
              {this.props.buttonNumberComponent
                ? this.props.buttonNumberComponent(
                  "0",
                  this.onPressButtonNumber
                )
                : this.renderButtonNumber("0")}
            </Col>
            <Col
              style={
                this.props.styleColumnButtons
                  ? this.props.styleColumnButtons
                  : styles.colButtonCircle
              }>
              <Animate
                show={true}
                start={{
                  opacity: 0.5
                }}
                update={{
                  opacity: [
                    password.length === 0 ||
                    password.length === this.props.passwordLength
                      ? 0.5
                      : 1
                  ],
                  timing: { duration: 400, ease: easeLinear }
                }}>
                {({ opacity }: any) =>
                  this.props.buttonDeleteComponent
                    ? this.props.buttonDeleteComponent(
                    () =>
                      this.state.password.length > 0 &&
                      this.setState({
                        password: this.state.password.slice(0, -1)
                      })
                    )
                    : this.renderButtonDelete(opacity)
                }
              </Animate>
            </Col>
          </Row>
        </Grid>
      </View>
    );
  }
}

export default PinCode;

let styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  viewTitle: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: grid.unit * 4
  },
  row: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: grid.unit * 5.5
  },
  colButtonCircle: {
    marginLeft: grid.unit / 2,
    marginRight: grid.unit / 2,
    alignItems: "center",
    width: grid.unit * 4,
    height: grid.unit * 4
  },
  colEmpty: {
    marginLeft: grid.unit / 2,
    marginRight: grid.unit / 2,
    width: grid.unit * 4,
    height: grid.unit * 4
  },
  colIcon: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column"
  },
  text: {
    fontSize: grid.unit * 2,
    fontWeight: "200"
  },
  buttonCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: grid.unit * 4,
    height: grid.unit * 4,
    backgroundColor: "rgb(242, 245, 251)",
    borderRadius: grid.unit * 2
  },
  textTitle: {
    fontSize: 20,
    fontWeight: "200",
    lineHeight: grid.unit * 2.5
  },
  textSubtitle: {
    fontSize: grid.unit,
    fontWeight: "200",
    textAlign: "center"
  },
  viewCirclePassword: {
    flexDirection: "row",
    height: "auto",
    justifyContent: "center",
    alignItems: "center",
  },
  textDeleteButton: {
    fontWeight: "200",
    marginTop: 5
  }
});
