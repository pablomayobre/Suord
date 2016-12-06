port module Content exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Mouse exposing (Position)
import String
import Json.Decode as Json
import Array
import Maybe
import Debug
import DOM


type alias Flags =
    { services : List Service
    , vigilants : List Vigilant
    }


init : Flags -> ( Model, Cmd Msg )
init flags =
    { services =
        { list = flags.services
        , shown = List.range 0 (List.length flags.services)
        , ripples = Array.repeat (List.length flags.services) Nothing
        }
    , vigilants =
        { list = flags.vigilants
        , shown = List.range 0 (List.length flags.vigilants)
        , ripples = Array.repeat (List.length flags.vigilants) Nothing
        }
    , screen = ServicesScreen
    }
        ! []


main : Program Flags Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Model =
    { services : Services
    , vigilants : Vigilants
    , screen : Screen
    }


type alias Services =
    { list : List Service
    , shown : List Int
    , ripples : Array.Array (Maybe ( Int, Int ))
    }


type alias Vigilants =
    { list : List Vigilant
    , shown : List Int
    , ripples : Array.Array (Maybe ( Int, Int ))
    }


type alias Service =
    { name : String, has : Int, needs : Int }


type alias Vigilant =
    { name : String, assign : String }


type Screen
    = ServicesScreen
    | VigilantsScreen


type Msg
    = NoOp
    | ShowServiceItems (List Int)
    | NewServiceRipple Int ( Int, Int )
    | DeleteServiceRipple Int
    | ShowVigilantItems (List Int)
    | NewVigilantRipple Int ( Int, Int )
    | DeleteVigilantRipple Int
    | ChangeScreen String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        ShowServiceItems newShown ->
            let
                services =
                    model.services

                new =
                    { services | shown = newShown }
            in
                ( { model | services = new }, Cmd.none )

        NewServiceRipple index position ->
            let
                services =
                    model.services

                new =
                    { services | ripples = (Array.set index (Just position) services.ripples) }
            in
                ( { model | services = new }, Cmd.none )

        DeleteServiceRipple index ->
            let
                services =
                    model.services

                new =
                    { services | ripples = (Array.set index Nothing services.ripples) }
            in
                ( { model | services = new }, Cmd.none )

        ShowVigilantItems newShown ->
            let
                vigilants =
                    model.vigilants

                new =
                    { vigilants | shown = newShown }
            in
                ( { model | vigilants = new }, Cmd.none )

        NewVigilantRipple index position ->
            let
                vigilants =
                    model.vigilants

                new =
                    { vigilants | ripples = (Array.set index (Just position) vigilants.ripples) }
            in
                ( { model | vigilants = new }, Cmd.none )

        DeleteVigilantRipple index ->
            let
                vigilants =
                    model.vigilants

                new =
                    { vigilants | ripples = (Array.set index Nothing vigilants.ripples) }
            in
                ( { model | vigilants = new }, Cmd.none )

        ChangeScreen screen ->
            case screen of
                "Services" ->
                    ( { model | screen = ServicesScreen }, Cmd.none )

                "Vigilants" ->
                    ( { model | screen = VigilantsScreen }, Cmd.none )

                _ ->
                    ( model, Cmd.none )


view : Model -> Html Msg
view model =
    case model.screen of
        ServicesScreen ->
            viewServices model

        VigilantsScreen ->
            viewVigilants model


viewServices : Model -> Html Msg
viewServices model =
    ul [ class "services" ]
        (List.indexedMap (serviceItem model.services) model.services.list)


viewVigilants : Model -> Html Msg
viewVigilants model =
    ul [ class "vigilants" ]
        (List.indexedMap (vigilantItem model.vigilants) model.vigilants.list)


getPosition : DOM.Rectangle -> Int -> Int -> ( Int, Int )
getPosition rect x y =
    let
        left =
            x - (round rect.left)

        top =
            y - (round rect.top)
    in
        ( left, top )


rippleClick : (Int -> ( Int, Int ) -> Msg) -> Int -> Attribute Msg
rippleClick msg index =
    on "click"
        (Json.map
            (msg index)
            (Json.map3 getPosition
                (DOM.target (DOM.parentElement DOM.boundingClientRect))
                (Json.at [ "pageX" ] Json.int)
                (Json.at [ "pageY" ] Json.int)
            )
        )


rippleAnimated : (Int -> Msg) -> Int -> Attribute Msg
rippleAnimated msg index =
    on "animationend" (Json.succeed (msg index))


rippleCase : (Int -> ( Int, Int ) -> Msg) -> (Int -> Msg) -> Int -> Maybe ( Int, Int ) -> Html Msg
rippleCase clickmsg animatedmsg index position =
    case position of
        Just position ->
            let
                ( a, b ) =
                    position
            in
                rippleView clickmsg animatedmsg index True [ ( "top", (toString b) ++ "px" ), ( "left", (toString a) ++ "px" ) ]

        Nothing ->
            rippleView clickmsg animatedmsg index False [ ( "display", "none" ) ]


rippleView : (Int -> ( Int, Int ) -> Msg) -> (Int -> Msg) -> Int -> Bool -> List ( String, String ) -> Html Msg
rippleView clickmsg animatedmsg index active styleList =
    div
        [ classList [ ( "ripples", True ), ( "black", True ), ( "is-active", active ) ], (rippleClick clickmsg index), (rippleAnimated animatedmsg index) ]
        [ span [ class "ripple", style styleList ] [] ]


serviceItem : Services -> Int -> Service -> Html Msg
serviceItem services index service =
    let
        shown =
            List.member index services.shown

        progressValue =
            Basics.min service.has service.needs

        exceeded =
            service.has > service.needs

        progressText =
            (toString service.has) ++ "/" ++ (toString service.needs)
    in
        li
            [ classList [ ( "show", shown ) ] ]
            [ button
                [ class "serviceItem" ]
                [ label []
                    [ text service.name ]
                , progress
                    [ Html.Attributes.max (toString service.needs)
                    , value (toString progressValue)
                    , classList [ ( "exceeded", exceeded ) ]
                    ]
                    []
                , span [] [ text progressText ]
                , i [ classList [ ( "i", True ), ( "i-24px", True ), ( "i-chevron-down", True ) ] ] []
                , rippleCase NewServiceRipple
                    DeleteServiceRipple
                    index
                    (Maybe.withDefault Nothing (Array.get index services.ripples))
                ]
            ]


vigilantItem : Vigilants -> Int -> Vigilant -> Html Msg
vigilantItem vigilants index vigilant =
    let
        shown =
            List.member index vigilants.shown

        assigned =
            vigilant.assign
    in
        li
            [ classList [ ( "show", shown ) ] ]
            [ button
                [ class "vigilantItem" ]
                [ label []
                    [ text vigilant.name ]
                , span [] [ text assigned ]
                , i [ classList [ ( "i", True ), ( "i-24px", True ), ( "i-chevron-down", True ) ] ] []
                , rippleCase
                    NewVigilantRipple
                    DeleteVigilantRipple
                    index
                    (Maybe.withDefault Nothing (Array.get index vigilants.ripples))
                ]
            ]


port showServices : (List Int -> msg) -> Sub msg


port showVigilants : (List Int -> msg) -> Sub msg


port changeScreen : (String -> msg) -> Sub msg


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ showServices ShowServiceItems
        , showVigilants ShowVigilantItems
        , changeScreen ChangeScreen
        ]
